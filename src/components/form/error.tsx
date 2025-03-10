export interface FormErrorProps {
  errors?: string[];
}

export const errorInputStyle = "border-red-500 focus-visible:ring-red-500";

export function FormError({ errors }: FormErrorProps) {
  if (!errors?.length) {
    return null;
  }
  return (
    <div className="text-status-warning mt-1 text-sm">
      {errors.map((error, index) => (
        <div key={index} className="flex items-center gap-1">
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
}
