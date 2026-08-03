import { useState } from 'react';
import { useToast } from '@sanity/ui';
import { type DocumentActionComponent, useClient, useDataset } from 'sanity';

const DOCUMENT_ID = 'siteDeployment';
const DESTINATIONS = {
  development: 'Preview',
  production: 'Producción',
} as const;

export const siteDeploymentAction: DocumentActionComponent = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const client = useClient({ apiVersion: '2026-07-14' });
  const dataset = useDataset();
  const toast = useToast();
  const destination = DESTINATIONS[dataset as keyof typeof DESTINATIONS];
  const unsupportedDatasetMessage = `El dataset "${dataset}" no tiene un destino de actualización configurado.`;

  const requestDeployment = async () => {
    if (!destination) {
      setIsConfirming(false);
      toast.push({ status: 'error', title: unsupportedDatasetMessage });
      return;
    }

    setIsConfirming(false);
    setIsSubmitting(true);

    try {
      await client.transaction()
        .createIfNotExists({ _id: DOCUMENT_ID, _type: 'siteDeployment' })
        .patch(DOCUMENT_ID, { set: { requestedAt: new Date().toISOString() } })
        .commit();
      toast.push({ status: 'success', title: `Actualización de ${destination} solicitada.` });
    } catch (error) {
      toast.push({
        status: 'error',
        title: `No se pudo solicitar la actualización de ${destination}.`,
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    label: 'Actualizar sitio',
    tone: 'positive',
    disabled: isSubmitting || !destination,
    title: destination ? `Destino: ${destination}` : unsupportedDatasetMessage,
    onHandle: () => setIsConfirming(true),
    ...(isConfirming && destination && {
      dialog: {
        type: 'confirm' as const,
        message: `Se solicitará una nueva actualización de ${destination}. Continúa solo cuando hayas terminado de publicar el lote de contenido en el dataset "${dataset}".`,
        confirmButtonText: `Actualizar ${destination}`,
        cancelButtonText: 'Cancelar',
        onConfirm: requestDeployment,
        onCancel: () => setIsConfirming(false),
      },
    }),
  };
};
