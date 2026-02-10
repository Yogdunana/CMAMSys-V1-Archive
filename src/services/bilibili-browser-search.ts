/**
 * Bilibili Browser Search Service
 * 使用 Playwright 浏览器自动化搜索 B 站视频
 * 可以绕过 API 限制，获取真实的搜索结果
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { createLogger } from '@/lib/logger';

const logger = createLogger('BILIBILI_BROWSER_SEARCH');

interface BilibiliVideo {
  bvid: string;
  title: string;
  author: string;
  duration: number;
  viewCount: number;
  danmakuCount: number;
  replyCount: number;
  favoriteCount: number;
  thumbnail: string;
  publishDate: Date;
  description: string;
}

/**
 * 使用 Playwright 浏览器搜索 B 站视频
 */
export async function searchBilibiliVideosWithBrowser(
  keyword: string,
  options: {
    limit?: number;
    minDuration?: number;
    maxDuration?: number;
    minViewCount?: number;
  } = {}
): Promise<BilibiliVideo[]> {
  const { limit = 10, minDuration = 300, maxDuration = 3600, minViewCount = 1000 } = options;

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    logger.info(`Starting browser search for keyword: ${keyword}`);

    // 启动浏览器
    browser = await chromium.launch({
      headless: true, // 无头模式，不显示浏览器界面
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    // 创建浏览器上下文
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
    });

    const page = await context.newPage();

    // 访问 B 站搜索页面
    const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}&search_type=video`;
    logger.info(`Navigating to: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // 等待视频列表加载
    await page.waitForTimeout(2000); // 额外等待，确保页面完全加载

    // 尝试等待视频元素
    try {
      await page.waitForSelector('.video-item, .bili-video-card, .bili-video-card__info, a[href*="/video/"]', { timeout: 10000 });
    } catch (error) {
      logger.warn(`No video elements found within timeout, proceeding anyway`);
    }

    // 获取页面标题和 URL，用于调试
    const pageTitle = await page.title();
    const pageUrl = page.url();
    logger.info(`Page loaded: ${pageTitle}, URL: ${pageUrl}`);

    // 截图用于调试
    const screenshotPath = `/tmp/bilibili-search-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info(`Screenshot saved to ${screenshotPath}`);

    // 获取页面 HTML 结构，用于调试
    const pageContent = await page.content();
    logger.info(`Page HTML length: ${pageContent.length} characters`);

    // 检查是否有视频链接
    const videoLinksCount = await page.evaluate(() => {
      return document.querySelectorAll('a[href*="/video/"]').length;
    });
    logger.info(`Found ${videoLinksCount} video links on page`);

    // 提取视频信息
    const videos = await page.evaluate((params) => {
      const results: any[] = [];
      const { minDuration, maxDuration, minViewCount } = params;

      // 简化策略：直接查找所有视频链接
      const links = Array.from(document.querySelectorAll('a[href*="/video/"]'));

      links.forEach(link => {
        try {
          const href = link.getAttribute('href') || '';
          const bvidMatch = href.match(/BV[a-zA-Z0-9]{10}/);

          if (!bvidMatch) return;

          const bvid = bvidMatch[0];

          // 避免重复
          if (results.some(v => v.bvid === bvid)) return;

          // 提取标题 - 优先使用链接文本
          let title = link.textContent?.trim() || '';
          if (!title) {
            // 如果链接没有文本，尝试从父元素查找
            let parent = link.closest('li, div, article, section') || link.parentElement;
            title = parent?.querySelector('[class*="title"]')?.textContent?.trim() || '';
          }

          // 如果仍然没有标题，跳过
          if (!title) return;

          // 提取作者
          let parent = link.closest('li, div, article, section') || link.parentElement;
          const author = parent?.querySelector('[class*="author"], [class*="up"], [class*="owner"]')?.textContent?.trim() || '';

          // 提取时长
          const durationText = parent?.querySelector('[class*="duration"]')?.textContent?.trim() || '';
          const duration = parseDurationString(durationText);

          // 提取观看量
          const viewText = parent?.querySelector('[class*="view"], [class*="play"]')?.textContent?.trim() || '';
          let viewCount = 0;
          const match = viewText.match(/([\d.]+)(万|w)?/i);
          if (match) {
            const num = parseFloat(match[1]);
            const unit = match[2];
            viewCount = unit ? Math.floor(num * 10000) : Math.floor(num);
          }

          // 提取封面图
          const img = parent?.querySelector('img');
          const thumbnail = img?.getAttribute('src') || img?.getAttribute('data-src') || '';

          // 添加视频（暂时不过滤，以便调试）
          results.push({
            bvid,
            title: title.replace(/<[^>]*>/g, ''),
            author: author || '未知作者',
            duration,
            viewCount,
            danmakuCount: 0,
            replyCount: 0,
            favoriteCount: 0,
            thumbnail: thumbnail.startsWith('http') ? thumbnail : `https:${thumbnail}`,
            publishDate: new Date(),
            description: '',
          });
        } catch (error) {
          // 忽略单个项目的解析错误
        }
      });

      return results;
    }, { minDuration, maxDuration, minViewCount });

    logger.info(`Found ${videos.length} videos using browser search`);

    // 限制返回数量
    return videos.slice(0, limit);

  } catch (error) {
    logger.error(`Failed to search with browser: ${error}`, error);
    throw error;
  } finally {
    // 清理资源
    try {
      if (context) {
        await context.close();
      }
      if (browser) {
        await browser.close();
      }
    } catch (error) {
      logger.error(`Failed to close browser: ${error}`);
    }
  }
}

/**
 * 解析时长字符串（如 "10:30" -> 630 秒）
 */
function parseDurationString(durationStr: string): number {
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}
