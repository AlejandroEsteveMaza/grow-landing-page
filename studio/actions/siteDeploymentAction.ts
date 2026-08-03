import { useState } from 'react';
import { useToast } from '@sanity/ui';
import { type DocumentActionComponent, useClient } from 'sanity';

const DOCUMENT_ID = 'siteDeployment';

export const siteDeploymentAction: DocumentActionComponent = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const client = useClient({ apiVersion: '2026-07-14' });
  const toast = useToast();

  const requestDeployment = async () => {
    setIsConfirming(false);
    setIsSubmitting(true);

    try {
      await client.transaction()
        .createIfNotExists({ _id: DOCUMENT_ID, _type: 'siteDeployment' })
        .patch(DOCUMENT_ID, { set: { requestedAt: new Date().toISOString() } })
        .commit();
      toast.push({ status: 'success', title: 'Actualización de producción solicitada.' });
    } catch (error) {
      toast.push({
        status: 'error',
        title: 'No se pudo solicitar la actualización de producción.',
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    label: 'Actualizar producción',
    tone: 'positive',
    disabled: isSubmitting,
    onHandle: () => setIsConfirming(true),
    ...(isConfirming && {
      dialog: {
        type: 'confirm' as const,
        message: 'Se solicitará una nueva actualización de producción. Continúa solo cuando hayas terminado de publicar el lote de contenido.',
        confirmButtonText: 'Actualizar producción',
        cancelButtonText: 'Cancelar',
        onConfirm: requestDeployment,
        onCancel: () => setIsConfirming(false),
      },
    }),
  };
};
