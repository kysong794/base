import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            개인 게시판 설정 완료
          </h1>
          <p className="text-gray-600 mb-6">
            Spring Boot + React + Docker 환경이 준비되었습니다.
          </p>
          <div className="flex gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Spring Boot 3</span>
            <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">Tailwind</span>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
