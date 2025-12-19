
import { Customer, Vehicle } from "../types";

// 暂时关闭 AI 客户端初始化
// const getAIClient = () => {
//   return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
// };

/**
 * 暂时禁用的维护建议功能
 */
export const getMaintenanceAdvice = async (vehicle: Vehicle, customer: Customer) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return `[AI 功能已暂时关闭]
建议常规检查：
1. 检查机油液位与轮胎气压。
2. 确认上次保养后的行驶里程。
3. 检查刹车片磨损情况。`;
};

/**
 * 暂时禁用的业务分析功能
 */
export const analyzeBusinessData = async (customers: any[], transactions: any[]) => {
  // 返回静态经营提示
  return "当前 AI 洞察功能已暂停。请关注客户增长趋势与现金流状况，保持优质服务。";
};
