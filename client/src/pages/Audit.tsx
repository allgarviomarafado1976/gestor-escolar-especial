import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useLocation } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export default function Audit() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");

  // Redirect if not admin
  if (isAuthenticated && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-blue-200 mb-6">Apenas administradores podem aceder à auditoria.</p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const { data: auditLogs, isLoading: isLoadingLogs, error: logsError } = trpc.auditLog.list.useQuery(
    {
      userId: selectedUser ? parseInt(selectedUser) : undefined,
      entity: selectedEntity,
    },
    { enabled: user?.role === "admin" }
  );

  const { data: users, isLoading: isLoadingUsers } = trpc.users.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const entities = ["student", "student_measure", "user", "school", "measure", "report"];
  const actions = ["CREATE", "UPDATE", "DELETE"];

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-500 bg-opacity-20 text-green-300";
      case "UPDATE":
        return "bg-blue-500 bg-opacity-20 text-blue-300";
      case "DELETE":
        return "bg-red-500 bg-opacity-20 text-red-300";
      default:
        return "bg-gray-500 bg-opacity-20 text-gray-300";
    }
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      student: "Aluno",
      student_measure: "Medida de Aluno",
      user: "Utilizador",
      school: "Escola",
      measure: "Medida",
      report: "Relatório",
    };
    return labels[entity] || entity;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* Header */}
      <div className="bg-blue-950 bg-opacity-50 border-b-2 border-white border-opacity-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-white hover:bg-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Auditoria</h1>
              <p className="text-blue-200 text-sm">Registo de todas as alterações realizadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white">
              <SelectValue placeholder="Filtrar por utilizador" />
            </SelectTrigger>
            <SelectContent className="bg-blue-800 border-white border-opacity-30">
              <SelectItem value="all">Todos os utilizadores</SelectItem>
              {users?.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>
                  {u.name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white">
              <SelectValue placeholder="Filtrar por entidade" />
            </SelectTrigger>
            <SelectContent className="bg-blue-800 border-white border-opacity-30">
              <SelectItem value="all">Todas as entidades</SelectItem>
              {entities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {getEntityLabel(entity)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audit Log Table */}
        <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg overflow-hidden backdrop-blur-sm">
          {isLoadingLogs && (
            <div className="p-8 text-center">
              <p className="text-blue-300">A carregar registos de auditoria...</p>
            </div>
          )}
          {logsError && (
            <div className="p-8 text-center">
              <p className="text-red-300 mb-4">Erro ao carregar registos de auditoria</p>
              <p className="text-blue-200 text-sm">{logsError.message}</p>
            </div>
          )}
          {!isLoadingLogs && !logsError && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-white border-opacity-20">
                    <th className="px-6 py-4 text-left text-white font-bold">Data/Hora</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Utilizador</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Ação</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Entidade</th>
                    <th className="px-6 py-4 text-left text-white font-bold">ID</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs && auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-white border-opacity-10 hover:bg-blue-700 hover:bg-opacity-30 transition-colors"
                    >
                      <td className="px-6 py-4 text-blue-200 text-sm">
                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", {
                          locale: pt,
                        })}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {users?.find((u) => u.id === log.userId)?.name ||
                          users?.find((u) => u.id === log.userId)?.email ||
                          "Desconhecido"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded text-sm font-bold ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-200">{getEntityLabel(log.entity)}</td>
                      <td className="px-6 py-4 text-blue-200">{log.entityId || "-"}</td>
                      <td className="px-6 py-4 text-blue-200 text-sm">
                        {log.details ? (
                          <details className="cursor-pointer">
                            <summary className="hover:underline">Ver detalhes</summary>
                            <pre className="mt-2 bg-blue-900 bg-opacity-50 p-2 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-blue-300">
                          Nenhum registo de auditoria encontrado
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-white font-bold mb-3">Legenda de Ações</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded text-sm font-bold bg-green-500 bg-opacity-20 text-green-300">
                CREATE
              </span>
              <span className="text-blue-200">Novo registo criado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded text-sm font-bold bg-blue-500 bg-opacity-20 text-blue-300">
                UPDATE
              </span>
              <span className="text-blue-200">Registo atualizado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded text-sm font-bold bg-red-500 bg-opacity-20 text-red-300">
                DELETE
              </span>
              <span className="text-blue-200">Registo eliminado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
