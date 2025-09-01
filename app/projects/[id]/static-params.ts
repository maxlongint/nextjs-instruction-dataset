import { mockProjects } from '../../lib/mock-data';

// 生成静态参数 - 这是一个服务器组件函数
export async function generateStaticParams() {
    return mockProjects.map(project => ({
        id: project.id.toString(),
    }));
}

// 重新导出以供其他地方使用
export default generateStaticParams;
