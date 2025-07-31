import { mockProjects } from '../../lib/mock-data';

// 生成静态参数
export async function generateStaticParams() {
  return mockProjects.map((project) => ({
    id: project.id.toString(),
  }));
}