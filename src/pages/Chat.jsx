import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { perguntarOrg, getOrgId, clearTokens } from '@/lib/rotas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Send, 
  Plus, 
  Database, 
  LogOut, 
  MessageSquare, 
  Loader2,
  Menu,
  X,
  Code
} from 'lucide-react';

const Chat = () => {
  const [pergunta, setPergunta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversaAtual, setConversaAtual] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Carregar histórico do localStorage
  useEffect(() => {
    const historicoSalvo = localStorage.getItem('chat_history');
    if (historicoSalvo) {
      setHistorico(JSON.parse(historicoSalvo));
    }
  }, []);

  // Salvar histórico no localStorage
  const salvarHistorico = (novoHistorico) => {
    setHistorico(novoHistorico);
    localStorage.setItem('chat_history', JSON.stringify(novoHistorico));
  };

  const handleLogout = () => {
    clearTokens();
    toast.success('Logout realizado');
    navigate('/');
  };

  const handleNovaConversa = () => {
    setConversaAtual(null);
    setPergunta('');
  };

  const handleEnviarPergunta = async (e) => {
    e.preventDefault();

    if (!pergunta.trim()) {
      toast.error('Por favor, digite uma pergunta');
      return;
    }

    const orgId = getOrgId();
    if (!orgId) {
      toast.error('Organização não encontrada. Faça login novamente.');
      handleLogout();
      return;
    }

    setIsLoading(true);

    try {
      const response = await perguntarOrg({
        org_id: orgId,
        pergunta: pergunta.trim(),
        max_linhas: 10,
        enrich: true,
      });

      const novaConversa = {
        id: Date.now(),
        pergunta: pergunta.trim(),
        resposta: response,
        timestamp: new Date().toISOString(),
      };

      setConversaAtual(novaConversa);
      
      // Adicionar ao histórico
      const novoHistorico = [novaConversa, ...historico];
      salvarHistorico(novoHistorico);

      toast.success('Consulta realizada com sucesso!');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao processar pergunta';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const abrirConversa = (conversa) => {
    setConversaAtual(conversa);
    setPergunta('');
  };

  const renderResposta = (resposta) => {
    return (
      <div className="space-y-4">
        {/* SQL Gerado */}
        {resposta.sql_text && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">SQL Gerado</span>
              </div>
              <pre className="text-xs bg-card p-3 rounded-md overflow-x-auto border border-border">
                <code>{resposta.sql_text}</code>
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Resumo Enriquecido */}
        {resposta.resumo_enriquecido && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2 text-primary">Resumo</h3>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                {resposta.resumo_enriquecido}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Resultados */}
        {resposta.columns && resposta.rows && resposta.rows.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Resultados ({resposta.rows.length} linhas)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      {resposta.columns.map((col, idx) => (
                        <th 
                          key={idx} 
                          className="px-4 py-2 text-left font-medium border border-border"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resposta.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-muted/50 transition-colors">
                        {row.map((cell, cellIdx) => (
                          <td 
                            key={cellIdx} 
                            className="px-4 py-2 border border-border"
                          >
                            {cell !== null ? String(cell) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* JSON Completo (fallback) */}
        {!resposta.columns && !resposta.rows && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(resposta, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-card border-r border-border transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Database className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">QueryFlow</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          <Button 
            onClick={handleNovaConversa} 
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-4">
            {historico.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma conversa ainda
              </p>
            ) : (
              historico.map((conversa) => (
                <button
                  key={conversa.id}
                  onClick={() => abrirConversa(conversa)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    conversaAtual?.id === conversa.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conversa.pergunta.substring(0, 60)}
                        {conversa.pergunta.length > 60 ? '...' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conversa.timestamp).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <h2 className="font-semibold">
              {conversaAtual ? 'Conversa' : 'Nova Consulta'}
            </h2>
          </div>
        </header>

        {/* Conteúdo */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Instruções fixas */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">
                  Faça uma pesquisa dentro dos dados de sua empresa
                </h3>
                <p className="text-muted-foreground">
                  Faça uma <strong>pergunta única</strong>. Quanto mais informações você 
                  colocar, mais precisa tende a ser a nossa devolução.
                </p>
              </CardContent>
            </Card>

            {/* Conteúdo dinâmico */}
            {conversaAtual ? (
              // Modo leitura
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">Sua pergunta:</p>
                        <p className="text-foreground/90">{conversaAtual.pergunta}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Resposta
                  </h3>
                  {renderResposta(conversaAtual.resposta)}
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleNovaConversa}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Conversa
                  </Button>
                </div>
              </div>
            ) : (
              // Formulário de nova pergunta
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleEnviarPergunta} className="space-y-4">
                    <div>
                      <Textarea
                        placeholder="Descreva o que você quer buscar nos dados da empresa..."
                        value={pergunta}
                        onChange={(e) => setPergunta(e.target.value)}
                        disabled={isLoading}
                        rows={6}
                        className="resize-none transition-all duration-200 focus:shadow-elegant"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading || !pergunta.trim()}
                        className="bg-gradient-to-r from-primary to-accent"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Pergunta
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default Chat;
