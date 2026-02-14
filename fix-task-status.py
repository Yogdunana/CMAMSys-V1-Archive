#!/usr/bin/env python3
"""
修复任务状态脚本
"""

import requests
import json
import sys

# 任务 ID
TASK_ID = "cmlhktmot0000uguh5r4wpvgy"

# API 端点
CHECK_API = f"http://localhost:5000/api/debug/debug-code-generation?taskId={TASK_ID}"
FIX_API = "http://localhost:5000/api/debug/fix-task-status"

def check_task_status():
    """检查任务状态"""
    try:
        response = requests.get(CHECK_API)
        if response.status_code == 200:
            data = response.json()
            print("当前任务状态:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return data
        else:
            print(f"检查失败: {response.status_code}")
            return None
    except Exception as e:
        print(f"检查错误: {e}")
        return None

def fix_task_status(fix_type):
    """修复任务状态"""
    print(f"\n修复任务状态 (类型: {fix_type})...")

    # 注意：这里需要有效的 token
    # 在实际使用中，应该从 localStorage 获取 token
    headers = {
        'Content-Type': 'application/json',
        # 'Authorization': 'Bearer YOUR_TOKEN_HERE',
    }

    data = {
        'taskId': TASK_ID,
        'fixType': fix_type,
    }

    try:
        response = requests.post(FIX_API, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print("修复结果:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return result
        else:
            print(f"修复失败: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"修复错误: {e}")
        return None

if __name__ == '__main__':
    print("=" * 60)
    print("任务状态修复工具")
    print("=" * 60)

    # 检查当前状态
    status = check_task_status()

    if status and status.get('success'):
        task_data = status['data']['task']

        # 分析问题
        print("\n" + "=" * 60)
        print("问题分析:")
        print("=" * 60)

        issues = []

        if task_data['codeGenerationId'] is None and task_data['overallStatus'] == 'CODING':
            issues.append("任务状态为 CODING，但没有代码生成记录")

        if status['data']['codeGenerations']['allCount'] == 0 and task_data['validationStatus'] == 'PASSED':
            issues.append("验证状态为 PASSED，但没有验证记录")

        if issues:
            print("发现以下问题:")
            for i, issue in enumerate(issues, 1):
                print(f"{i}. {issue}")

            print("\n建议修复方案:")
            print("1. sync-to-actual - 根据实际记录同步状态")
            print("2. reset-to-discussion - 重置到讨论阶段")
            print("3. reset-to-coding - 重置到编码阶段")

            # 自动修复
            if len(issues) >= 2:
                print("\n自动选择: reset-to-discussion")
                fix_task_status('reset-to-discussion')
        else:
            print("未发现问题，任务状态正常")
    else:
        print("无法获取任务状态")
        sys.exit(1)
