'use strict';

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

module.exports = {
  init(strapi) {
    const cleanOldComments = async () => {
      try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const oldComments = await strapi.entityService.findMany('api::comment.comment', {
          filters: {
            createdAt: {
              $lt: oneYearAgo.toISOString(),
            },
          },
          limit: 100,
        });

        if (oldComments && oldComments.length > 0) {
          for (const comment of oldComments) {
            await strapi.entityService.delete('api::comment.comment', comment.id);
          }
          strapi.log.info(`[Cron] Deleted ${oldComments.length} old comments`);
        }
      } catch (error) {
        strapi.log.error('[Cron] Error cleaning old comments:', error);
      }
    };

    const removeDuplicates = async () => {
      try {
        const comments = await strapi.entityService.findMany('api::comment.comment', {
          limit: 1000,
          sort: { createdAt: 'desc' },
        });

        if (!comments || comments.length === 0) return;

        const seen = new Map();
        const duplicates = [];

        for (const comment of comments) {
          const key = `${comment.email}-${comment.message?.trim()}`;
          if (seen.has(key)) {
            duplicates.push(comment.id);
          } else {
            seen.set(key, comment.id);
          }
        }

        if (duplicates.length > 0) {
          for (const id of duplicates) {
            await strapi.entityService.delete('api::comment.comment', id);
          }
          strapi.log.info(`[Cron] Removed ${duplicates.length} duplicate comments`);
        }
      } catch (error) {
        strapi.log.error('[Cron] Error removing duplicates:', error);
      }
    };

    const collectStatistics = async () => {
      try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
          strapi.entityService.count('api::comment.comment', {
            filters: {
              createdAt: {
                $gte: today.toISOString(),
              },
            },
          }),
          strapi.entityService.count('api::comment.comment', {
            filters: {
              createdAt: {
                $gte: weekAgo.toISOString(),
              },
            },
          }),
          strapi.entityService.count('api::comment.comment', {
            filters: {
              createdAt: {
                $gte: monthAgo.toISOString(),
              },
            },
          }),
          strapi.entityService.count('api::comment.comment'),
        ]);

        strapi.log.info(`[Cron] Statistics - Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}, Total: ${totalCount}`);
      } catch (error) {
        strapi.log.error('[Cron] Error collecting statistics:', error);
      }
    };

    const cleanTempFiles = async () => {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        if (!fs.existsSync(uploadsDir)) {
          return;
        }

        const files = fs.readdirSync(uploadsDir);
        let deletedCount = 0;

        for (const file of files) {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);

          if (stats.isFile()) {
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (stats.mtime.getTime() < oneWeekAgo) {
              fs.unlinkSync(filePath);
              deletedCount++;
            }
          }
        }

        if (deletedCount > 0) {
          strapi.log.info(`[Cron] Deleted ${deletedCount} old temporary files`);
        }
      } catch (error) {
        strapi.log.error('[Cron] Error cleaning temp files:', error);
      }
    };

    const checkDatabaseHealth = async () => {
      try {
        const startTime = Date.now();
        const testQuery = await strapi.entityService.count('api::comment.comment');
        const responseTime = Date.now() - startTime;

        if (responseTime > 5000) {
          strapi.log.warn(`[Cron] Database health check: Slow response time ${responseTime}ms`);
        } else {
          strapi.log.info(`[Cron] Database health check: OK (${responseTime}ms)`);
        }
      } catch (error) {
        strapi.log.error('[Cron] Database health check failed:', error);
      }
    };

    const backupComments = async () => {
      try {
        const comments = await strapi.entityService.findMany('api::comment.comment', {
          limit: 10000,
          sort: { createdAt: 'desc' },
        });

        if (!comments || comments.length === 0) {
          strapi.log.info('[Cron] No comments to backup');
          return;
        }

        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `comments-backup-${timestamp}.json`);

        const backupData = {
          timestamp: new Date().toISOString(),
          totalComments: comments.length,
          comments: comments.map(comment => ({
            id: comment.id,
            name: comment.name,
            email: comment.email,
            phone: comment.phone,
            message: comment.message,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          })),
        };

        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        strapi.log.info(`[Cron] Backup created: ${backupFile} (${comments.length} comments)`);

        const oldBackups = fs.readdirSync(backupDir)
          .filter(file => file.startsWith('comments-backup-') && file.endsWith('.json'))
          .map(file => ({
            name: file,
            path: path.join(backupDir, file),
            time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
          }))
          .sort((a, b) => b.time - a.time);

        if (oldBackups.length > 10) {
          for (let i = 10; i < oldBackups.length; i++) {
            fs.unlinkSync(oldBackups[i].path);
          }
          strapi.log.info(`[Cron] Removed ${oldBackups.length - 10} old backup files`);
        }
      } catch (error) {
        strapi.log.error('[Cron] Error creating backup:', error);
      }
    };

    const cleanSpamComments = async () => {
      try {
        const spamPatterns = [
          /\b(купить|продать|заработок|деньги|кредит|ссылк|bit\.ly|tinyurl|http:\/\/[a-z0-9]+\.[a-z]{2,})/i,
          /\b(viagra|cialis|casino|poker|betting)/i,
        ];

        const recentComments = await strapi.entityService.findMany('api::comment.comment', {
          filters: {
            createdAt: {
              $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
          },
          limit: 500,
        });

        if (!recentComments || recentComments.length === 0) return;

        let spamCount = 0;

        for (const comment of recentComments) {
          const message = comment.message || '';
          const name = comment.name || '';
          const email = comment.email || '';
          const combinedText = `${name} ${email} ${message}`;

          const isSpam = spamPatterns.some(pattern => pattern.test(combinedText));

          if (isSpam) {
            await strapi.entityService.delete('api::comment.comment', comment.id);
            spamCount++;
          }
        }

        if (spamCount > 0) {
          strapi.log.info(`[Cron] Removed ${spamCount} spam comments`);
        }
      } catch (error) {
        strapi.log.error('[Cron] Error cleaning spam comments:', error);
      }
    };

    const monitorPerformance = async () => {
      try {
        const memoryUsage = process.memoryUsage();
        const memoryMB = {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
        };

        const uptime = Math.round(process.uptime() / 3600);

        if (memoryMB.heapUsed > 500) {
          strapi.log.warn(`[Cron] Performance warning: High memory usage - Heap: ${memoryMB.heapUsed}MB, RSS: ${memoryMB.rss}MB`);
        }

        strapi.log.info(`[Cron] Performance - Memory: ${memoryMB.heapUsed}MB/${memoryMB.heapTotal}MB, RSS: ${memoryMB.rss}MB, Uptime: ${uptime}h`);
      } catch (error) {
        strapi.log.error('[Cron] Error monitoring performance:', error);
      }
    };

    cron.schedule('0 2 * * *', () => {
      strapi.log.info('[Cron] Starting daily cleanup tasks');
      cleanOldComments();
      removeDuplicates();
      collectStatistics();
      cleanTempFiles();
    });

    cron.schedule('0 */6 * * *', () => {
      strapi.log.info('[Cron] Running duplicate check');
      removeDuplicates();
    });

    cron.schedule('0 0 * * *', () => {
      strapi.log.info('[Cron] Collecting daily statistics');
      collectStatistics();
    });

    cron.schedule('0 3 * * 0', () => {
      strapi.log.info('[Cron] Weekly temp files cleanup');
      cleanTempFiles();
    });

    cron.schedule('*/30 * * * *', () => {
      checkDatabaseHealth();
    });

    cron.schedule('0 4 * * *', () => {
      strapi.log.info('[Cron] Daily backup');
      backupComments();
    });

    cron.schedule('0 */4 * * *', () => {
      strapi.log.info('[Cron] Checking for spam comments');
      cleanSpamComments();
    });

    cron.schedule('*/15 * * * *', () => {
      monitorPerformance();
    });

    const checkPostsCount = async () => {
      try {
        const totalCount = await strapi.entityService.count('api::comment.comment');
        const timestamp = new Date().toLocaleString('ru-RU', {
          timeZone: 'Europe/Moscow',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        strapi.log.info(`[Cron] Задача 1 - Проверка постов: Общее количество постов = ${totalCount} (${timestamp})`);
      } catch (error) {
        strapi.log.error('[Cron] Ошибка при проверке количества постов:', error);
      }
    };

    const removeShortMessages = async () => {
      try {
        const allPosts = await strapi.entityService.findMany('api::comment.comment', {
          limit: 10000,
        });

        if (!allPosts || allPosts.length === 0) {
          strapi.log.info('[Cron] Задача 2 - Нет постов для проверки');
          return;
        }

        let deletedCount = 0;
        const postsToDelete = [];

        for (const post of allPosts) {
          const message = post.message || '';
          if (message.length < 10) {
            postsToDelete.push(post.id);
          }
        }

        if (postsToDelete.length > 0) {
          for (const id of postsToDelete) {
            await strapi.entityService.delete('api::comment.comment', id);
            deletedCount++;
          }
          strapi.log.info(`[Cron] Задача 2 - Удалено постов с message < 10 символов: ${deletedCount}`);
        }

        const remainingCount = await strapi.entityService.count('api::comment.comment');
        const timestamp = new Date().toLocaleString('ru-RU', {
          timeZone: 'Europe/Moscow',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        strapi.log.info(`[Cron] Задача 2 - Количество оставшихся постов: ${remainingCount} (${timestamp})`);
      } catch (error) {
        strapi.log.error('[Cron] Ошибка при удалении постов с короткими сообщениями:', error);
      }
    };

    const findLongestPost = async () => {
      try {
        const allPosts = await strapi.entityService.findMany('api::comment.comment', {
          limit: 10000,
        });

        if (!allPosts || allPosts.length === 0) {
          strapi.log.info('[Cron] Задача 3 - Нет постов для проверки');
          return;
        }

        let longestPost = null;
        let maxLength = 0;

        for (const post of allPosts) {
          const messageLength = (post.message || '').length;
          if (messageLength > maxLength) {
            maxLength = messageLength;
            longestPost = post;
          }
        }

        if (longestPost) {
          const timestamp = new Date().toLocaleString('ru-RU', {
            timeZone: 'Europe/Moscow',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          strapi.log.info(`[Cron] Задача 3 - Пост с самым большим количеством символов в message:`);
          strapi.log.info(`  ID: ${longestPost.id}`);
          strapi.log.info(`  Имя: ${longestPost.name || 'Не указано'}`);
          strapi.log.info(`  Email: ${longestPost.email || 'Не указано'}`);
          strapi.log.info(`  Количество символов в message: ${maxLength}`);
          strapi.log.info(`  Первые 100 символов message: ${(longestPost.message || '').substring(0, 100)}...`);
          strapi.log.info(`  Дата создания: ${new Date(longestPost.createdAt).toLocaleString('ru-RU')}`);
          strapi.log.info(`  Время проверки: ${timestamp}`);
        } else {
          strapi.log.info('[Cron] Задача 3 - Не удалось найти пост с длинным сообщением');
        }
      } catch (error) {
        strapi.log.error('[Cron] Ошибка при поиске поста с самым длинным message:', error);
      }
    };

    cron.schedule('*/1 * * * *', () => {
      checkPostsCount();
    });

    cron.schedule('*/2 * * * *', () => {
      removeShortMessages();
    });

    cron.schedule('15 22 * * *', () => {
      strapi.log.info('[Cron] Запуск задачи 3 - Поиск поста с самым длинным message');
      findLongestPost();
    });

    strapi.log.info('[Cron] Запуск задачи 1 сразу при старте...');
    checkPostsCount();

    strapi.log.info('[Cron] Cron jobs initialized');
  },
};

