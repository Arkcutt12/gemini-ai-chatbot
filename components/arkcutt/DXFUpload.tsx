'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  X
} from "lucide-react";
import { validateDXFFile } from '@/lib/api/dxf-analysis';

interface DXFUploadProps {
  onFileUploaded: (file: File) => void;
  maxSize?: number; // in MB
  accept?: string;
}

export function DXFUpload({ 
  onFileUploaded, 
  maxSize = 10,
  accept = ".dxf,.dwg" 
}: DXFUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);

  const handleFileValidation = useCallback(async (file: File) => {
    const validation = await validateDXFFile(file);
    
    if (validation.valid) {
      setSelectedFile(file);
      setValidationErrors([]);
      setIsValidated(true);
    } else {
      setValidationErrors(validation.errors);
      setSelectedFile(null);
      setIsValidated(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileValidation(files[0]);
    }
  }, [handleFileValidation]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileValidation(files[0]);
    }
  }, [handleFileValidation]);

  const handleUpload = () => {
    if (selectedFile && isValidated) {
      onFileUploaded(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationErrors([]);
    setIsValidated(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <Card className={`
        border-2 border-dashed transition-colors cursor-pointer
        ${isDragOver ? 'border-blue-500 bg-blue-50' : 
          selectedFile ? 'border-green-500 bg-green-50' : 
          'border-gray-300 hover:border-gray-400'}
      `}>
        <CardContent 
          className="p-8 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <>
              <Upload className={`
                mx-auto h-12 w-12 mb-4
                ${isDragOver ? 'text-blue-500' : 'text-gray-400'}
              `} />
              <h3 className="text-lg font-semibold mb-2">
                {isDragOver ? 'Suelta el archivo aquí' : 'Sube tu archivo DXF'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Arrastra y suelta tu archivo DXF o haz clic para seleccionar
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Formatos soportados: DXF, DWG</p>
                <p>• Tamaño máximo: {maxSize}MB</p>
                <p>• Se analizarán las dimensiones y complejidad automáticamente</p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2 text-green-800">
                Archivo validado correctamente
              </h3>
              <div className="bg-white p-4 rounded-lg border inline-block">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {/* Hidden file input */}
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            id="dxf-upload"
          />
          
          {!selectedFile && (
            <label htmlFor="dxf-upload">
              <Button className="mt-4" asChild>
                <span>Seleccionar archivo</span>
              </Button>
            </label>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">
                  Errores de validación:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {selectedFile && isValidated && (
        <div className="flex justify-center">
          <Button onClick={handleUpload} size="lg" className="px-8">
            Analizar archivo DXF
          </Button>
        </div>
      )}

      {/* File Format Help */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            💡 Consejos para mejores resultados
          </h4>
          <ul className="space-y-1 text-blue-700 text-sm">
            <li>• Asegúrate de que todas las líneas estén cerradas para formas que requieren corte interior</li>
            <li>• Usa diferentes capas (layers) para diferentes tipos de corte si es necesario</li>
            <li>• Revisa las dimensiones - el análisis detectará automáticamente el tamaño de tu pieza</li>
            <li>• Los archivos más simples tendrán costos de corte menores</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}