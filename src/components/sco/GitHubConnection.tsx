import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Github, RefreshCw, GitCommit, FileCode, Folder,
  Star, GitFork, Clock, ExternalLink, Code2, FileText
} from 'lucide-react';
import { useGitHubSCO } from '@/hooks/useGitHubSCO';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export function GitHubConnection() {
  const { 
    loading, 
    experiments, 
    engines, 
    commits, 
    repoInfo,
    fetchAll,
    fetchFileContent
  } = useGitHubSCO();
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleFileClick = async (path: string) => {
    if (selectedFile === path) {
      setSelectedFile(null);
      setFileContent(null);
      return;
    }
    
    setSelectedFile(path);
    setLoadingFile(true);
    const content = await fetchFileContent(path);
    setFileContent(content?.content || null);
    setLoadingFile(false);
  };

  return (
    <Card className="bg-black/40 border-gray-500/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-300">
            <Github className="w-5 h-5" />
            GitHub Connection
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAll}
              disabled={loading}
              className="border-gray-500/30 hover:bg-gray-500/20"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('https://github.com/MRamiBalles/PvsNP', '_blank')}
              className="border-gray-500/30 hover:bg-gray-500/20"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Repo Info */}
        {repoInfo && (
          <div className="flex items-center gap-4 mt-3 text-sm">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {repoInfo.language}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-3 h-3" />
              {repoInfo.stars}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <GitFork className="w-3 h-3" />
              {repoInfo.forks}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(repoInfo.updatedAt), { addSuffix: true })}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Experiments */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-cyan-300">
              <FileCode className="w-4 h-4" />
              Experiments ({experiments.length})
            </h4>
            <ScrollArea className="h-[150px] rounded-lg border border-cyan-500/20 bg-black/30 p-2">
              {loading && experiments.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-8 bg-gray-700/50" />
                  ))}
                </div>
              ) : (
                <AnimatePresence>
                  {experiments.map((exp, idx) => (
                    <motion.div
                      key={exp.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleFileClick(exp.path)}
                      className={`p-2 rounded cursor-pointer flex items-center gap-2 text-sm ${
                        selectedFile === exp.path 
                          ? 'bg-cyan-500/20 text-cyan-300' 
                          : 'hover:bg-gray-500/20'
                      }`}
                    >
                      {exp.name.endsWith('.py') ? (
                        <Code2 className="w-3 h-3 text-yellow-400" />
                      ) : (
                        <FileText className="w-3 h-3 text-blue-400" />
                      )}
                      {exp.name}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </ScrollArea>
          </div>
          
          {/* Engines */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-green-300">
              <Folder className="w-4 h-4" />
              Engines ({engines.length})
            </h4>
            <ScrollArea className="h-[150px] rounded-lg border border-green-500/20 bg-black/30 p-2">
              {loading && engines.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-8 bg-gray-700/50" />
                  ))}
                </div>
              ) : (
                <AnimatePresence>
                  {engines.map((eng, idx) => (
                    <motion.div
                      key={eng.path}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-2 rounded hover:bg-gray-500/20 flex items-center gap-2 text-sm"
                    >
                      <Folder className="w-3 h-3 text-green-400" />
                      {eng.name}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </ScrollArea>
          </div>
        </div>
        
        {/* File Preview */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-purple-500/20 bg-black/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-purple-500/10 border-b border-purple-500/20">
                  <span className="text-xs text-purple-300 font-mono">{selectedFile}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileContent(null);
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Close
                  </Button>
                </div>
                <ScrollArea className="h-[200px] p-3">
                  {loadingFile ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-4 bg-gray-700/50" />
                      ))}
                    </div>
                  ) : (
                    <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                      {fileContent || 'No content available'}
                    </pre>
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Recent Commits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2 text-orange-300">
            <GitCommit className="w-4 h-4" />
            Recent Commits
          </h4>
          <ScrollArea className="h-[120px] rounded-lg border border-orange-500/20 bg-black/30 p-2">
            {loading && commits.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-10 bg-gray-700/50" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {commits.map((commit, idx) => (
                  <motion.div
                    key={commit.sha}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-2 rounded bg-black/30 border border-gray-500/10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-300 border-orange-500/30 font-mono">
                        {commit.sha}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{commit.message}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
