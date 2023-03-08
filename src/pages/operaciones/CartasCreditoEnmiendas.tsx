import { useLazyGetCartaComercialQuery } from "@/apis";
import { AdminLoadingActivity, AdminBreadcrumbs, AdminPageHeader } from "@/components";
import { useAppDispatch } from "@/store";
import { apiHost } from "@/utils/apiConfig";
import { faFileInvoiceDollar, faCircleArrowLeft, faSave, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Label, TextInput, Textarea } from "flowbite-react";
import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import numeral from "numeral";
import { useAddEnmiendaMutation } from "@/apis/enmiendasApi";

export const CartasCreditoEnmiendas = () => {
  const routeParams = useParams();
  const nav = useNavigate();

  const dispatch = useAppDispatch();

  const [getCartaComercial, { data: cartaCreditoDetalle, isLoading }] = useLazyGetCartaComercialQuery();
  const [addEnmienda, { data, isSuccess, isError }] = useAddEnmiendaMutation();

  const _handleBack = useCallback(() => {
    nav(`/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}`);
  }, [cartaCreditoDetalle]);

  const _handleSubmit = () => {};

  useEffect(() => {
    if (routeParams.cartaCreditoId) {
      getCartaComercial(routeParams.cartaCreditoId);
    }
  }, [routeParams]);

  if (isLoading || !cartaCreditoDetalle) {
    return <AdminLoadingActivity />;
  }

  return (
    <>
      <div className="p-6 text-sm">
        <div className="mb-4">
          <AdminBreadcrumbs
            links={[
              { name: "Operaciones", href: "#" },
              { name: "Cartas de Crédito", href: `${apiHost}/#/operaciones/cartas-de-credito` },
              { name: "Detalle de Carta", href: "#" },
              { name: "Enmiendas", href: "#" },
            ]}
          />
        </div>
        <div className="mb-4">
          <AdminPageHeader title="Cartas de Crédito" subtitle="Emiendas" icon={faFileInvoiceDollar} />
        </div>

        <div className="mb-4">
          <Button outline color="dark" size="xs" onClick={_handleBack}>
            <FontAwesomeIcon icon={faCircleArrowLeft} className="mr-2" />
            Regresar
          </Button>
        </div>

        <form className="mb-12">
          <Card className="mb-4">
            <h3 className="text-lg font-bold">Registro - Edición de Enmienda</h3>
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5">
                <p className="flex-1 flex items-center justify-between">
                  Fecha de Solicitud: <span>{new Date().toLocaleDateString()}</span>
                </p>
                <p className="flex-1 flex items-center justify-between">
                  Referencia de Carta de Crédito: <span>{cartaCreditoDetalle.NumCartaCredito}</span>
                </p>
                <p className="flex-1 flex items-center justify-between">
                  Nombre del Contacto de Solicitante: <span>Test User</span>
                </p>
              </div>
              <div className="md:col-span-4 md:col-start-9 flex items-center">
                <p className="flex-1 flex items-center justify-between">
                  Banco: <span>{cartaCreditoDetalle.Banco}</span>
                </p>
              </div>
            </div>
          </Card>

          <Card className="mb-5">
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5 flex items-center justify-between gap-4">
                <Label value="Importe de L/C" />
                <TextInput value={numeral(cartaCreditoDetalle.MontoOriginalLC).format("$ 0,0.00")} disabled />
              </div>
              <div className="md:col-span-5 md:col-start-7 flex items-center justify-between gap-4">
                <Label value="Nuevo Importe de L/C" />
                <TextInput />
              </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5 flex items-center justify-between gap-4">
                <Label value="Fecha de Vencimiento" />
                <TextInput value={cartaCreditoDetalle.FechaVencimiento} disabled />
              </div>
              <div className="md:col-span-5 md:col-start-7 flex items-center justify-between gap-4">
                <Label value="Nueva Fecha de Vencimiento" />
                <TextInput />
              </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5 flex items-center justify-between gap-4">
                <Label value="Fecha Límite de Embarque" />
                <TextInput value={cartaCreditoDetalle.FechaLimiteEmbarque} disabled />
              </div>
              <div className="md:col-span-5 md:col-start-7 flex items-center justify-between gap-4">
                <Label value="Nueva Fecha Límite de Embarque" />
                <TextInput />
              </div>
            </div>
          </Card>

          <Card className="mb-4">
            <h3 className="font-bold">Descripción de Mercancías</h3>
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-6">
                <Label value="Actual" />
                <Textarea value={cartaCreditoDetalle.DescripcionMercancia} disabled />
              </div>
              <div className="md:col-span-6">
                <Label value="Debe Decir" />
                <Textarea />
              </div>
            </div>
          </Card>

          <Card className="mb-4">
            <h3 className="font-bold">Consideraciones Adicionales</h3>
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-6">
                <Label value="Actual" />
                <Textarea value={cartaCreditoDetalle.ConsideracionesAdicionales} disabled />
              </div>
              <div className="md:col-span-6">
                <Label value="Debe Decir" />
                <Textarea />
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="font-bold">Instrucciones Especiales</h3>
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-6">
                <Label value="Actual" />
                <Textarea value={cartaCreditoDetalle.InstruccionesEspeciales} disabled />
              </div>
              <div className="md:col-span-6">
                <Label value="Debe Decir" />
                <Textarea />
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <Button color="failure">
              <FontAwesomeIcon icon={faClose} className="mr-2" />
              Cancelar
            </Button>
            <Button>
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};