import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleHelp, Download, Upload } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { postForm } from '../../lib/api';
import { downloadLeadImportTemplate } from '../../lib/csv';
import type { CsvImportResponse } from '../../types';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

interface CsvImportModalProps {
  campaignId: string;
  autoMessage: boolean;
  assignedTemplateName: string | null;
  open: boolean;
  onClose: () => void;
}

export function CsvImportHelpButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="CSV upload help"
        aria-expanded={open}
      >
        <CircleHelp size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-elevated text-sm text-slate-600">
          <CsvFormatHelp />
          <button type="button" onClick={downloadLeadImportTemplate} className="btn-secondary mt-3 w-full">
            <Download size={14} />
            Download template
          </button>
        </div>
      )}
    </div>
  );
}

function CsvFormatHelp() {
  return (
    <div className="space-y-2">
      <p className="font-semibold text-slate-800">CSV format</p>
      <p>Phone and name are enough to send the opener. Use these columns:</p>
      <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed">
        <li>First name, Last name, Phone number (required)</li>
        <li>Preferred warehouse: Blouberg Branch or Durbanville Branch</li>
        <li>Email ID and City can be blank</li>
      </ul>
      <p className="text-xs">Phones can be +27 82…, 082…, or 2782…. Auto Message plus a selected template is what actually sends.</p>
    </div>
  );
}

export function CsvImportModal({
  campaignId,
  autoMessage,
  assignedTemplateName,
  open,
  onClose,
}: CsvImportModalProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CsvImportResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (upload: File) => {
      const body = new FormData();
      body.append('file', upload);
      return postForm<CsvImportResponse>(`/api/campaigns/${campaignId}/leads/import`, body);
    },
    onSuccess: (res) => {
      setResult(res);
      qc.invalidateQueries({ queryKey: ['campaign-leads', campaignId] });
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      if (res.errors.length === 0) {
        toast('success', `Imported ${res.created + res.reused} lead${res.created + res.reused === 1 ? '' : 's'}.`);
      } else {
        toast('error', `Imported with ${res.errors.length} row error${res.errors.length === 1 ? '' : 's'}.`);
      }
    },
    onError: (err: Error) => {
      toast('error', err.message ?? 'Failed to import CSV.');
    },
  });

  function handleClose() {
    setFile(null);
    setResult(null);
    mutation.reset();
    if (inputRef.current) inputRef.current.value = '';
    onClose();
  }

  const footer = result ? (
    <button onClick={handleClose} className="btn-primary">Done</button>
  ) : (
    <>
      <button onClick={handleClose} className="btn-secondary">Cancel</button>
      <button
        onClick={() => file && mutation.mutate(file)}
        disabled={!file || mutation.isPending}
        className="btn-primary"
      >
        {mutation.isPending ? <Spinner size="sm" /> : <Upload size={15} />}
        Import leads
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload CSV"
      subtitle="Add leads to this campaign from a spreadsheet"
      footer={footer}
    >
      {result ? (
        <ImportSummary
          result={result}
          autoMessage={autoMessage}
          assignedTemplateName={assignedTemplateName}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <label className="label">CSV file</label>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file ? <p className="text-xs text-slate-500 mt-1">{file.name}</p> : null}
          </div>
          {!autoMessage || !assignedTemplateName ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Leads will be saved. Turn on Auto Message and select a template to send the opener.
            </p>
          ) : null}
          <p className="text-xs text-slate-500">
            Required columns: First name, Last name, Phone number. Warehouse must be Blouberg Branch or Durbanville Branch.
          </p>
          <button type="button" onClick={downloadLeadImportTemplate} className="btn-secondary">
            <Download size={14} />
            Download template
          </button>
        </div>
      )}
    </Modal>
  );
}

function ImportSummary({
  result,
  autoMessage,
  assignedTemplateName,
}: {
  result: CsvImportResponse;
  autoMessage: boolean;
  assignedTemplateName: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryStat label="Created" value={result.created} />
        <SummaryStat label="Updated" value={result.reused} />
        <SummaryStat label="Opener sent" value={result.opener_sent} />
      </div>
      {!autoMessage || !assignedTemplateName ? (
        <p className="text-xs text-slate-500">
          Auto Message is off or no template is selected, so openers were not sent.
        </p>
      ) : null}
      {result.errors.length > 0 ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 overflow-hidden">
          <p className="px-3 py-2 text-xs font-semibold text-rose-700">
            {result.errors.length} row{result.errors.length === 1 ? '' : 's'} failed
          </p>
          <ul className="max-h-48 overflow-y-auto divide-y divide-rose-100 bg-white">
            {result.errors.map((item) => (
              <li key={`${item.row}-${item.phone}-${item.error}`} className="px-3 py-2 text-xs text-slate-700">
                Row {item.row}{item.phone ? ` (${item.phone})` : ''}: {item.error}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-slate-600">Every row imported.</p>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
