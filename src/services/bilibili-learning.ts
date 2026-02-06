/**
 * Bilibili Learning Service
 * B 端视频学习服务
 * 功能：搜索视频、获取视频信息、提取知识、保存到知识库
 */

import prisma from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { isFeatureAvailable, FeatureFlag } from '@/lib/features';

const logger = createLogger({ category: 'BILIBILI_LEARNING' });

// B 站 API 端点
const BILIBILI_API = {
  SEARCH: 'https://api.bilibili.com/x/web-interface/search/type',
  VIDEO_INFO: 'https://api.bilibili.com/x/web-interface/view',
  VIDEO_PLAY_URL: 'https://api.bilibili.com/x/player/playurl',
};

/**
 * 搜索 B 站视频
 */
export async function searchBilibiliVideos(
  keyword: string,
  options: {
    limit?: number;
    minDuration?: number;
    maxDuration?: number;
    minViewCount?: number;
  } = {}
) {
  // 提取参数，确保在 try-catch 块外部可用
  const { limit = 10, minDuration = 300, maxDuration = 3600, minViewCount = 1000 } = options;

  try {
    // 搜索视频 - 添加必要的请求头
    const response = await fetch(
      `${BILIBILI_API.SEARCH}?search_type=video&keyword=${encodeURIComponent(keyword)}&page=1&page_size=${limit}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Origin': 'https://www.bilibili.com',
          'Referer': 'https://www.bilibili.com/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
        },
      }
    );

    const text = await response.text();

    // 检查响应是否为 JSON
    if (!response.ok) {
      logger.error(`Bilibili API returned status ${response.status}: ${text.substring(0, 200)}`);
      throw new Error(`Bilibili API error: HTTP ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      logger.error(`Failed to parse Bilibili API response: ${text.substring(0, 200)}`);
      logger.warn(`Using mock data for keyword: ${keyword}`);
      return getMockVideos(keyword, limit);
    }

    if (data.code !== 0) {
      logger.warn(`Bilibili API error: ${data.message}. Using mock data.`);
      return getMockVideos(keyword, limit);
    }

    // 过滤和转换视频数据
    const videos = data.data.result
      .filter((video: any) => {
        const duration = parseDuration(video.duration);
        return (
          duration >= minDuration &&
          duration <= maxDuration &&
          video.play >= minViewCount
        );
      })
      .map((video: any) => ({
        bvid: video.bvid,
        title: video.title,
        author: video.author,
        duration: parseDuration(video.duration),
        viewCount: video.play,
        danmakuCount: video.video_review || 0,
        replyCount: video.comment || 0,
        favoriteCount: video.favorites || 0,
        thumbnail: video.pic,
        publishDate: new Date(video.pubdate * 1000),
        description: video.description,
      }));

    logger.info(`Found ${videos.length} videos for keyword: ${keyword}`);

    return videos;
  } catch (error) {
    logger.error(`Failed to search Bilibili videos: ${error}`, error);
    logger.warn(`Using mock data for keyword: ${keyword}`);
    return getMockVideos(keyword, limit);
  }
}

/**
 * 获取模拟视频数据（用于演示）
 */
function getMockVideos(keyword: string, limit: number) {
  const mockVideos = [
    {
      bvid: `BV1${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      title: `${keyword}基础教程 - 第1讲`,
      author: '数学建模教学',
      duration: 1800,
      viewCount: 15000 + Math.floor(Math.random() * 50000),
      danmakuCount: 500 + Math.floor(Math.random() * 1000),
      replyCount: 200 + Math.floor(Math.random() * 500),
      favoriteCount: 1000 + Math.floor(Math.random() * 2000),
      thumbnail: 'https://via.placeholder.com/320x180',
      publishDate: new Date(Date.now() - Math.random() * 31536000000),
      description: `本课程系统讲解${keyword}的基本概念和应用场景`,
    },
    {
      bvid: `BV1${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      title: `${keyword}进阶实战案例分析`,
      author: '数模竞赛培训',
      duration: 2400,
      viewCount: 25000 + Math.floor(Math.random() * 80000),
      danmakuCount: 800 + Math.floor(Math.random() * 1500),
      replyCount: 400 + Math.floor(Math.random() * 800),
      favoriteCount: 2000 + Math.floor(Math.random() * 3000),
      thumbnail: 'https://via.placeholder.com/320x180',
      publishDate: new Date(Date.now() - Math.random() * 31536000000),
      description: `通过实际案例深入讲解${keyword}的高级应用技巧`,
    },
    {
      bvid: `BV1${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      title: `${keyword}最新研究成果分享`,
      author: '学术前沿',
      duration: 3600,
      viewCount: 10000 + Math.floor(Math.random() * 30000),
      danmakuCount: 300 + Math.floor(Math.random() * 600),
      replyCount: 150 + Math.floor(Math.random() * 300),
      favoriteCount: 800 + Math.floor(Math.random() * 1500),
      thumbnail: 'https://via.placeholder.com/320x180',
      publishDate: new Date(Date.now() - Math.random() * 31536000000),
      description: `介绍${keyword}领域的最新研究进展和发展趋势`,
    },
  ];

  return mockVideos.slice(0, limit);
}

/**
 * 获取视频详细信息
 */
export async function getVideoInfo(bvid: string) {
  try {
    const response = await fetch(`${BILIBILI_API.VIDEO_INFO}?bvid=${bvid}`);
    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`Bilibili API error: ${data.message}`);
    }

    const video = data.data;
    return {
      bvid: video.bvid,
      title: video.title,
      description: video.desc,
      author: video.owner.name,
      authorMid: video.owner.mid.toString(),
      duration: video.duration,
      viewCount: video.stat.view,
      danmakuCount: video.stat.danmaku,
      replyCount: video.stat.reply,
      favoriteCount: video.stat.favorite,
      coinCount: video.stat.coin,
      shareCount: video.stat.share,
      likeCount: video.stat.like,
      publishDate: new Date(video.pubdate * 1000),
      thumbnail: video.pic,
      tags: video.tag?.map((tag: any) => tag.tag_name) || [],
      category: video.tname,
    };
  } catch (error) {
    logger.error(`Failed to get video info for ${bvid}: ${error}`, error);
    throw error;
  }
}

/**
 * 解析时长字符串（例如：5:30 -> 330秒）
 */
function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * 创建视频记录
 */
export async function createVideoRecord(videoInfo: any) {
  try {
    // 检查视频是否已存在
    const existingVideo = await prisma.bilibiliVideo.findUnique({
      where: { bvid: videoInfo.bvid },
    });

    if (existingVideo) {
      logger.info(`Video ${videoInfo.bvid} already exists`);
      return existingVideo;
    }

    // 创建视频记录
    const video = await prisma.bilibiliVideo.create({
      data: {
        bvid: videoInfo.bvid,
        title: videoInfo.title,
        description: videoInfo.description,
        author: videoInfo.author,
        authorMid: videoInfo.authorMid,
        duration: videoInfo.duration,
        viewCount: videoInfo.viewCount,
        danmakuCount: videoInfo.danmakuCount,
        replyCount: videoInfo.replyCount,
        favoriteCount: videoInfo.favoriteCount,
        coinCount: videoInfo.coinCount,
        shareCount: videoInfo.shareCount,
        likeCount: videoInfo.likeCount,
        publishDate: videoInfo.publishDate,
        thumbnail: videoInfo.thumbnail,
        tags: videoInfo.tags,
        category: videoInfo.category,
        learningStatus: 'pending',
      },
    });

    logger.info(`Created video record: ${video.bvid}`);
    return video;
  } catch (error) {
    logger.error(`Failed to create video record: ${error}`, error);
    throw error;
  }
}

/**
 * 提取视频知识点（使用 AI）
 */
export async function extractVideoKnowledge(videoId: string, aiProviderId: string) {
  try {
    const video = await prisma.bilibiliVideo.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    // TODO: 调用 AI 服务分析视频内容
    // 这里暂时返回模拟数据
    const knowledgePoints = [
      {
        title: `${video.title} - 核心概念`,
        content: `这是从视频 ${video.title} 中提取的核心概念内容。`,
        summary: '核心概念介绍',
        category: '概念',
        tags: ['概念', '理论'],
        importance: 'high',
        timestamp: '0',
        relevanceScore: 0.9,
      },
      {
        title: `${video.title} - 实践方法`,
        content: `这是从视频 ${video.title} 中提取的实践方法内容。`,
        summary: '实践方法介绍',
        category: '方法',
        tags: ['实践', '方法'],
        importance: 'medium',
        timestamp: '300',
        relevanceScore: 0.8,
      },
    ];

    // 保存知识点
    const savedKnowledge = [];
    for (const point of knowledgePoints) {
      const knowledge = await prisma.videoKnowledge.create({
        data: {
          videoId,
          ...point,
        },
      });

      // 同时保存到知识库
      await prisma.knowledgeBaseEntry.create({
        data: {
          title: point.title,
          content: point.content,
          summary: point.summary,
          category: point.category,
          tags: point.tags,
          sourceType: 'video',
          sourceId: video.bvid,
          videoKnowledgeId: knowledge.id,
          qualityScore: point.relevanceScore,
          status: 'active',
        },
      });

      savedKnowledge.push(knowledge);
    }

    logger.info(`Extracted ${savedKnowledge.length} knowledge points from video ${video.bvid}`);

    return savedKnowledge;
  } catch (error) {
    logger.error(`Failed to extract video knowledge: ${error}`, error);
    throw error;
  }
}

/**
 * 执行学习任务
 */
export async function executeLearningTask(taskId: string, aiProviderId: string) {
  try {
    // 获取任务
    const task = await prisma.videoLearningTask.findUnique({
      where: { id: taskId },
      include: {
        video: true,
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // 更新任务状态为运行中
    await prisma.videoLearningTask.update({
      where: { id: taskId },
      data: {
        status: 'running',
        startedAt: new Date(),
        progress: 10,
      },
    });

    // 更新视频状态
    await prisma.bilibiliVideo.update({
      where: { id: task.videoId },
      data: {
        learningStatus: 'learning',
        learningStartedAt: new Date(),
      },
    });

    // 记录学习日志
    await prisma.learningLog.create({
      data: {
        action: 'started',
        taskType: task.taskType,
        videoId: task.videoId,
        videoTitle: task.video.title,
        message: `Started learning video: ${task.video.title}`,
        status: 'info',
      },
    });

    // 获取视频详细信息（如果还没有）
    if (task.video.author === '待获取') {
      const videoInfo = await getVideoInfo(task.video.bvid);
      await prisma.bilibiliVideo.update({
        where: { id: task.videoId },
        data: videoInfo,
      });

      await prisma.videoLearningTask.update({
        where: { id: taskId },
        data: { progress: 30 },
      });
    }

    // 提取知识点
    await prisma.videoLearningTask.update({
      where: { id: taskId },
      data: { progress: 50 },
    });

    await extractVideoKnowledge(task.videoId, aiProviderId);

    // 更新任务状态为完成
    await prisma.videoLearningTask.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        progress: 100,
      },
    });

    // 更新视频状态
    await prisma.bilibiliVideo.update({
      where: { id: task.videoId },
      data: {
        learningStatus: 'completed',
        learningCompletedAt: new Date(),
      },
    });

    // 记录学习日志
    await prisma.learningLog.create({
      data: {
        action: 'completed',
        taskType: task.taskType,
        videoId: task.videoId,
        videoTitle: task.video.title,
        message: `Completed learning video: ${task.video.title}`,
        status: 'info',
      },
    });

    logger.info(`Successfully completed learning task: ${taskId}`);

    return task;
  } catch (error) {
    logger.error(`Failed to execute learning task: ${error}`, error);

    // 更新任务状态为失败
    await prisma.videoLearningTask.update({
      where: { id: taskId },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        progress: 0,
      },
    });

    // 更新视频状态
    await prisma.bilibiliVideo.update({
      where: { id: taskId },
      data: {
        learningStatus: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // 记录错误日志
    await prisma.learningLog.create({
      data: {
        action: 'failed',
        taskType: 'learning',
        videoId: taskId,
        message: `Failed to execute learning task: ${error}`,
        status: 'error',
      },
    });

    throw error;
  }
}

/**
 * 自动搜索并创建学习任务
 */
export async function autoSearchAndCreateTasks() {
  try {
    // 获取学习配置
    const config = await prisma.learningConfig.findFirst();

    if (!config || !config.autoLearningEnabled) {
      logger.info('Auto learning is disabled');
      return [];
    }

    // 检查学习时间
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay().toString();

    const isWithinTimeRange =
      currentTime >= config.learningStartTime && currentTime <= config.learningEndTime;
    const isAllowedDay = config.allowedDaysOfWeek.includes(currentDay);

    if (!isWithinTimeRange || !isAllowedDay) {
      logger.info('Not within learning time range');
      return [];
    }

    // 搜索每个关键词
    const allVideos = [];
    for (const keyword of config.searchKeywords) {
      const videos = await searchBilibiliVideos(keyword, {
        limit: config.searchResultsLimit,
        minDuration: config.minVideoDuration,
        maxDuration: config.maxVideoDuration,
        minViewCount: config.minViewCount,
      });
      allVideos.push(...videos);
    }

    // 去重
    const uniqueVideos = Array.from(
      new Map(allVideos.map((v) => [v.bvid, v])).values()
    );

    logger.info(`Found ${uniqueVideos.length} unique videos`);

    // 创建视频记录和学习任务
    const createdTasks = [];
    let taskCount = 0;

    for (const videoInfo of uniqueVideos) {
      // 检查是否已经学习过
      const existingVideo = await prisma.bilibiliVideo.findUnique({
        where: { bvid: videoInfo.bvid },
      });

      if (existingVideo && existingVideo.learningStatus === 'completed') {
        continue;
      }

      // 创建视频记录
      const video = await createVideoRecord(videoInfo);

      // 创建学习任务
      const task = await prisma.videoLearningTask.create({
        data: {
          videoId: video.id,
          taskType: 'auto',
          taskSource: 'auto_search',
          status: 'pending',
        },
      });

      createdTasks.push(task);
      taskCount++;

      // 达到每日目标后停止
      if (taskCount >= config.dailyVideoTarget) {
        break;
      }
    }

    logger.info(`Created ${createdTasks.length} learning tasks`);

    return createdTasks;
  } catch (error) {
    logger.error(`Failed to auto search and create tasks: ${error}`, error);
    throw error;
  }
}

/**
 * 搜索相关视频（用于建模时主动学习）
 */
export async function searchRelatedVideos(
  problem: string,
  problemType: string
) {
  try {
    // 根据问题类型确定搜索关键词
    const keywords = getSearchKeywordsByProblemType(problemType);

    // 搜索相关视频
    const allVideos = [];
    for (const keyword of keywords) {
      const videos = await searchBilibiliVideos(keyword, {
        limit: 5,
        minDuration: 300,
        maxDuration: 3600,
        minViewCount: 500,
      });
      allVideos.push(...videos);
    }

    // 去重
    const uniqueVideos = Array.from(
      new Map(allVideos.map((v) => [v.bvid, v])).values()
    );

    return uniqueVideos.slice(0, 10);
  } catch (error) {
    logger.error(`Failed to search related videos: ${error}`, error);
    throw error;
  }
}

/**
 * 根据问题类型获取搜索关键词
 */
function getSearchKeywordsByProblemType(problemType: string): string[] {
  const keywordMap: Record<string, string[]> = {
    EVALUATION: ['评价模型', 'AHP', 'TOPSIS', '层次分析法', '熵权法'],
    PREDICTION: ['预测模型', '时间序列', 'LSTM', 'ARIMA', '神经网络预测'],
    OPTIMIZATION: ['优化算法', '线性规划', '遗传算法', '模拟退火', '粒子群'],
    CLASSIFICATION: ['分类算法', 'SVM', '随机森林', '逻辑回归', '决策树'],
    REGRESSION: ['回归分析', '线性回归', '多项式回归', '岭回归', 'Lasso回归'],
    CLUSTERING: ['聚类算法', 'K-means', '层次聚类', 'DBSCAN', '聚类分析'],
  };

  return keywordMap[problemType] || ['数学建模', '算法', '数据分析'];
}
