'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';

interface GenerationResult {
  success: boolean;
  question?: string;
  error?: string;
  segmentIndex: number;
  content: string;
}

interface GenerationResultsTableProps {
  results: GenerationResult[];
}

export default function GenerationResultsTable({
  results,
}: GenerationResultsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>状态</TableHead>
          <TableHead>生成的问题</TableHead>
          <TableHead>原始段落</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result, index) => (
          <TableRow key={index}>
            <TableCell>
              {result.success ? (
                <Badge variant="default">成功</Badge>
              ) : (
                <Badge variant="destructive">失败</Badge>
              )}
            </TableCell>
            <TableCell>{result.question || result.error}</TableCell>
            <TableCell>{result.content}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}