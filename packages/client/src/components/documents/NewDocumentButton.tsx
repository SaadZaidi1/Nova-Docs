import Button from '../ui/Button';

interface NewDocumentButtonProps {
  onClick: () => void;
  loading?: boolean;
}

/**
 * Prominent "New Document" button for the dashboard.
 */
export default function NewDocumentButton({ onClick, loading }: NewDocumentButtonProps) {
  return (
    <Button onClick={onClick} loading={loading} variant="primary" size="md">
      <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      New Document
    </Button>
  );
}
