interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-red-600">{message}</p>
    </div>
  );
}
