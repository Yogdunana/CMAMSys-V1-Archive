# 城市共享单车投放优化问题
# 使用遗传算法的简化求解方案

import numpy as np
import random

class Region:
    """区域信息"""
    def __init__(self, id: int, name: str, x: float, y: float, demand: float):
        self.id = id
        self.name = name
        self.x = x
        self.y = y
        self.demand = demand

class Station:
    """站点信息"""
    def __init__(self, id: int, x: float, y: float, bikes: int):
        self.id = id
        self.x = x
        self.y = y
        self.bikes = bikes

class GeneticAlgorithm:
    """遗传算法 - 简化版本"""
    
    def __init__(self, regions: list, population_size=30, mutation_rate=0.1):
        self.regions = regions
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.best_solution = None
        self.best_fitness = float('inf')
    
    def initialize_population(self) -> list:
        """初始化种群"""
        population = []
        for _ in range(self.population_size):
            # 随机生成解：为每个区域分配一定数量的单车
            solution = []
            for region in self.regions:
                # 单车数量基于需求量，加随机扰动
                bikes = max(0, int(region.demand * random.uniform(0.8, 1.2)))
                solution.append(Station(region.id, region.x, region.y, bikes))
            population.append(solution)
        return population
    
    def fitness(self, solution: list) -> float:
        """计算适应度（总成本）"""
        # 目标：最小化总成本
        # 成本 = (总单车数量 * 100) + (未满足需求惩罚)
        
        total_bikes = sum(station.bikes for station in solution)
        
        # 计算未满足的需求
        penalty = 0
        for station, region in zip(solution, self.regions):
            if station.bikes < region.demand:
                penalty += (region.demand - station.bikes) * 50
        
        cost = total_bikes * 100 + penalty
        return cost
    
    def select(self, population: list) -> list:
        """选择操作 - 锦标赛选择"""
        selected = []
        for _ in range(len(population)):
            # 随机选择 3 个个体，选择适应度最好的
            candidates = random.sample(population, 3)
            candidates_with_fitness = [(self.fitness(sol), sol) for sol in candidates]
            best = min(candidates_with_fitness, key=lambda x: x[0])[1]
            selected.append(best)
        return selected
    
    def crossover(self, parent1: list, parent2: list) -> tuple:
        """交叉操作 - 单点交叉"""
        crossover_point = random.randint(1, len(parent1) - 1)
        child1 = parent1[:crossover_point] + parent2[crossover_point:]
        child2 = parent2[:crossover_point] + parent1[crossover_point:]
        return child1, child2
    
    def mutate(self, solution: list) -> list:
        """变异操作"""
        mutated = solution.copy()
        # 随机选择一个站点进行变异
        idx = random.randint(0, len(mutated) - 1)
        station = mutated[idx]
        region = self.regions[idx]
        
        # 变异：单车数量在原基础上增减 20%
        if random.random() < 0.5:
            station.bikes = max(0, int(station.bikes * random.uniform(0.8, 1.2)))
        else:
            station.bikes = max(0, int(region.demand * random.uniform(0.8, 1.2)))
        
        return mutated
    
    def evolve(self, generations=50):
        """进化过程"""
        print(f"初始化种群，种群大小: {self.population_size}")
        population = self.initialize_population()
        
        # 评估初始种群
        fitness_values = [self.fitness(sol) for sol in population]
        min_idx = np.argmin(fitness_values)
        self.best_fitness = fitness_values[min_idx]
        self.best_solution = population[min_idx]
        print(f"初始最佳适应度: {self.best_fitness:.2f}")
        
        for gen in range(generations):
            # 评估适应度
            fitness_values = [self.fitness(sol) for sol in population]
            
            # 更新最佳解
            min_idx = np.argmin(fitness_values)
            current_best_fitness = fitness_values[min_idx]
            
            if current_best_fitness < self.best_fitness:
                self.best_fitness = current_best_fitness
                self.best_solution = population[min_idx]
                print(f"  第 {gen+1} 代: 新最佳适应度 = {self.best_fitness:.2f}")
            
            # 选择、交叉、变异
            selected = self.select(population)
            new_population = []
            
            for i in range(0, len(selected), 2):
                if i + 1 < len(selected):
                    child1, child2 = self.crossover(selected[i], selected[i + 1])
                    if random.random() < self.mutation_rate:
                        child1 = self.mutate(child1)
                    if random.random() < self.mutation_rate:
                        child2 = self.mutate(child2)
                    new_population.append(child1)
                    new_population.append(child2)
            
            # 保留最佳个体（精英保留）
            new_population.append(self.best_solution)
            population = new_population[:self.population_size]
        
        return self.best_solution, self.best_fitness

def main():
    """主函数"""
    print("=" * 60)
    print("城市共享单车投放优化问题")
    print("=" * 60)
    
    # 创建示例区域数据
    regions = [
        Region(1, "市中心", 116.4, 39.9, 50),
        Region(2, "东部商业区", 116.5, 39.9, 40),
        Region(3, "西部住宅区", 116.3, 39.9, 60),
        Region(4, "南部工业区", 116.4, 39.8, 30),
        Region(5, "北部高校区", 116.4, 40.0, 45),
    ]
    
    print(f"\n区域数量: {len(regions)}")
    total_demand = sum(r.demand for r in regions)
    print(f"总需求量: {total_demand} 辆")
    
    # 创建优化器
    optimizer = GeneticAlgorithm(regions, population_size=30)
    
    # 优化
    print("\n开始优化...")
    best_solution, best_fitness = optimizer.optimize()
    
    # 输出结果
    print("\n" + "=" * 60)
    print("优化结果")
    print("=" * 60)
    print(f"最佳适应度（总成本）: {best_fitness:.2f}")
    print(f"\n最佳投放方案:")
    total_bikes = 0
    for station in best_solution:
        region = next(r for r in regions if r.id == station.id)
        print(f"  {region.name} (区域 {station.id}): {station.bikes} 辆 (需求: {region.demand})")
        total_bikes += station.bikes
    
    print(f"\n总投放单车数: {total_bikes}")
    print(f"单车利用率: {(total_demand / total_bikes * 100):.1f}%")
    print("=" * 60)
    print("✅ 优化完成！")

if __name__ == "__main__":
    main()
