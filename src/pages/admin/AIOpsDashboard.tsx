import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, FileText, Database } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ScrapedPaper {
    id: number;
    title: string;
    source_url: string;
    publication_date: string;
    created_at: string;
    problem_id: number;
}

const AIOpsDashboard = () => {
    const [papers, setPapers] = useState<ScrapedPaper[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScraping, setIsScraping] = useState(false);

    const fetchLogs = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('research_papers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            toast.error("Failed to fetch logs");
        } else {
            setPapers(data as any);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const triggerScraper = async () => {
        setIsScraping(true);
        try {
            const { data, error } = await supabase.functions.invoke('arxiv-scraper');
            if (error) throw error;
            toast.success(`Scraper finished. Found ${data.count} papers.`);
            fetchLogs();
        } catch (e: any) {
            toast.error("Scraper failed: " + e.message);
        } finally {
            setIsScraping(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Operations</h2>
                    <p className="text-muted-foreground">Monitor and control the Autonomous Researcher bots.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Logs
                    </Button>
                    <Button onClick={triggerScraper} disabled={isScraping}>
                        {isScraping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                        Trigger Scraper
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Total Papers Indexed</div>
                    <div className="text-2xl font-bold">{papers.length > 0 ? "20+" : "0"}</div>
                </Card>
                <Card className="p-6 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Last Scrape Status</div>
                    <div className="text-2xl font-bold text-green-500">Active</div>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Recent Ingestions
                    </h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Source ID</TableHead>
                            <TableHead>Ingested At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : papers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No logs found.</TableCell>
                            </TableRow>
                        ) : (
                            papers.map((paper) => (
                                <TableRow key={paper.id}>
                                    <TableCell className="font-mono text-xs">{paper.id}</TableCell>
                                    <TableCell className="font-medium max-w-md truncate" title={paper.title}>
                                        {paper.title}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {paper.source_url.split('/').pop()}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(paper.created_at).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default AIOpsDashboard;
