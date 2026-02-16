import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取任务列表
 * GET /api/auto-modeling/[id]/task-list
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    // 这里应该从数据库获取任务列表
    // 示例实现：返回存储在 discussion.summary.taskList 中的任务列表
    // TODO: 实现实际的数据库查询

    return NextResponse.json({
      taskList: [],
      message: '任务列表获取成功',
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return NextResponse.json(
      { error: '获取任务列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新任务列表
 * PUT /api/auto-modeling/[id]/task-list
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { taskList } = body;

    if (!Array.isArray(taskList)) {
      return NextResponse.json(
        { error: '任务列表格式错误' },
        { status: 400 }
      );
    }

    // 这里应该将任务列表保存到数据库
    // 示例实现：将任务列表保存到 discussion.summary.taskList
    // TODO: 实现实际的数据库更新

    return NextResponse.json({
      taskList,
      message: '任务列表已保存',
    });
  } catch (error) {
    console.error('保存任务列表失败:', error);
    return NextResponse.json(
      { error: '保存任务列表失败' },
      { status: 500 }
    );
  }
}
