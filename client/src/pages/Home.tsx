import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Users, BookOpen, BarChart3, FileText, Settings, LogOut } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center">
        <div className="text-white text-xl">A carregar...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Gestor Escolar</h1>
            <p className="text-blue-200">Educação Especial - Decreto-Lei 54/2018</p>
          </div>

          <div className="bg-blue-800 bg-opacity-50 border-2 border-white border-opacity-30 rounded-lg p-8 backdrop-blur-sm">
            <p className="text-white text-center mb-6">
              Plataforma de gestão de medidas de suporte à inclusão escolar para agrupamentos de escolas.
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold text-lg py-6">
                Iniciar Sessão
              </Button>
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-white text-sm">
            <div className="border-l-2 border-white border-opacity-50 pl-4">
              <p className="font-bold">Gestão de Alunos</p>
              <p className="text-blue-200 text-xs">Registo completo</p>
            </div>
            <div className="border-l-2 border-white border-opacity-50 pl-4">
              <p className="font-bold">Medidas DL 54</p>
              <p className="text-blue-200 text-xs">Universais, Seletivas, Adicionais</p>
            </div>
            <div className="border-l-2 border-white border-opacity-50 pl-4">
              <p className="font-bold">Relatórios</p>
              <p className="text-blue-200 text-xs">Exportáveis em PDF</p>
            </div>
            <div className="border-l-2 border-white border-opacity-50 pl-4">
              <p className="font-bold">Auditoria</p>
              <p className="text-blue-200 text-xs">Rastreabilidade completa</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* Header */}
      <div className="bg-blue-950 bg-opacity-50 border-b-2 border-white border-opacity-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestor Escolar</h1>
            <p className="text-blue-200 text-sm">Educação Especial - DL 54/2018</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-bold">{user?.name || "Utilizador"}</p>
              <p className="text-blue-200 text-sm capitalize">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-white hover:bg-blue-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Alunos Card */}
          <div
            onClick={() => setLocation("/alunos")}
            className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 cursor-pointer hover:bg-opacity-60 transition-all backdrop-blur-sm group"
          >
            <div className="flex items-start justify-between mb-4">
              <Users className="w-8 h-8 text-white" />
              <div className="w-12 h-12 border-2 border-white border-opacity-30 rounded-lg"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Gestão de Alunos</h2>
            <p className="text-blue-200 text-sm mb-4">
              Registo completo de alunos com informações sobre escola, turma e necessidades especiais.
            </p>
            <Button variant="ghost" className="text-white hover:bg-blue-700 w-full justify-start">
              Aceder →
            </Button>
          </div>

          {/* Medidas Card */}
          <div
            onClick={() => setLocation("/medidas")}
            className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 cursor-pointer hover:bg-opacity-60 transition-all backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <BookOpen className="w-8 h-8 text-white" />
              <div className="w-12 h-12 border-2 border-white border-opacity-30 rounded-lg"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Medidas de Suporte</h2>
            <p className="text-blue-200 text-sm mb-4">
              Gestão de medidas Universais, Seletivas e Adicionais conforme DL 54/2018.
            </p>
            <Button variant="ghost" className="text-white hover:bg-blue-700 w-full justify-start">
              Aceder →
            </Button>
          </div>

          {/* Dashboard Card */}
          <div
            onClick={() => setLocation("/dashboard")}
            className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 cursor-pointer hover:bg-opacity-60 transition-all backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
              <div className="w-12 h-12 border-2 border-white border-opacity-30 rounded-lg"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-blue-200 text-sm mb-4">
              Visualize estatísticas e indicadores filtráveis por escola e medidas.
            </p>
            <Button variant="ghost" className="text-white hover:bg-blue-700 w-full justify-start">
              Aceder →
            </Button>
          </div>

          {/* Relatórios Card */}
          <div
            onClick={() => setLocation("/relatorios")}
            className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 cursor-pointer hover:bg-opacity-60 transition-all backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <FileText className="w-8 h-8 text-white" />
              <div className="w-12 h-12 border-2 border-white border-opacity-30 rounded-lg"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Relatórios</h2>
            <p className="text-blue-200 text-sm mb-4">
              Gere relatórios exportáveis em PDF com síntese de medidas.
            </p>
            <Button variant="ghost" className="text-white hover:bg-blue-700 w-full justify-start">
              Aceder →
            </Button>
          </div>

          {/* Auditoria Card - Only for admins */}
          {user?.role === "admin" && (
            <div
              onClick={() => setLocation("/auditoria")}
              className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 cursor-pointer hover:bg-opacity-60 transition-all backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <Settings className="w-8 h-8 text-white" />
                <div className="w-12 h-12 border-2 border-white border-opacity-30 rounded-lg"></div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Auditoria</h2>
              <p className="text-blue-200 text-sm mb-4">
                Consulte o registo de todas as alterações para rastreabilidade completa.
              </p>
              <Button variant="ghost" className="text-white hover:bg-blue-700 w-full justify-start">
                Aceder →
              </Button>
            </div>
          )}

          {/* Administração Card - Only for admins */}
          {user?.role === "admin" && (
            <div
              onClick={() => setLocation("/admin")}
              className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 cursor-pointer hover:bg-opacity-60 transition-all backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <Settings className="w-8 h-8 text-white" />
                <div className="w-12 h-12 border-2 border-white border-opacity-30 rounded-lg"></div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Administração</h2>
              <p className="text-blue-200 text-sm mb-4">
                Gerencie utilizadores, escolas e configurações do sistema.
              </p>
              <Button variant="ghost" className="text-white hover:bg-blue-700 w-full justify-start">
                Aceder →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
