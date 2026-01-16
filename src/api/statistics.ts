import client from './client';

export interface DailyCount {
    date: string;
    count: number;
}

export interface DashboardResponse {
    totalPosts: number;
    totalMembers: number;
    dailyPostCounts: DailyCount[];
    dailyMemberCounts: DailyCount[];
}

export const getDashboardStatistics = async () => {
    const response = await client.get<DashboardResponse>('/admin/statistics/dashboard');
    return response.data;
};
