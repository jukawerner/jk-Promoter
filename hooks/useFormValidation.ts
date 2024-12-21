import { useState, useCallback } from 'react';

interface ValidationState {
  [key: string]: string | null;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationState>({});

  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = useCallback(() => {
    return Object.values(errors).some(error => error !== null);
  }, [errors]);

  return {
    errors,
    setFieldError,
    clearErrors,
    hasErrors
  };
};
