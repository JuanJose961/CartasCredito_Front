import { useLazyGetSwiftBase64Query } from "@/apis";
import { useClonarCartaComercialMutation, useLazyGetCartaComercialQuery, useUpdateCartaComercialEstatusMutation } from "@/apis/cartasCreditoApi";
import { AdminBreadcrumbs, AdminLoadingActivity, AdminPageHeader, CartaSwiftModal } from "@/components";
import { ICartaComercial } from "@/interfaces";
import { useAppDispatch } from "@/store";
import { addToast } from "@/store/uiSlice";
import { apiHost } from "@/utils/apiConfig";
import { faFileInvoiceDollar, faCircleArrowLeft, faUpload, faDollarSign, faCheckCircle, faPlusCircle, faFilePen, faPrint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Label, Modal, TextInput, Textarea } from "flowbite-react";
import numeral from "numeral";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type EstatusButtonProps = {
  estatus: number;
};

export const EstatusButton = ({ estatus }: EstatusButtonProps) => {
  var btn = (
    <Button size="sm" className="bg-brandPrimary">
      Registrada
    </Button>
  );
  switch (estatus) {
    case 1:
      btn = (
        <Button size="sm" className="bg-brandPrimary">
          Registrada
        </Button>
      );
      break;
    case 2:
      btn = (
        <Button size="sm" color="dark">
          Emitida
        </Button>
      );
      break;
    case 21:
      btn = (
        <Button size="sm" color="warning">
          Enmienda Pendiente
        </Button>
      );
      break;
    case 3:
      btn = (
        <Button size="sm" color="warning">
          Enmienda Pendiente
        </Button>
      );
      break;
    case 4:
      btn = (
        <Button size="sm" color="success">
          Pagada
        </Button>
      );
      break;
    case 5:
      btn = (
        <Button size="sm" className="bg-brandPrimary">
          Registrada
        </Button>
      );
      break;
  }

  return btn;
};

export const CartasDeCreditoDetalle = () => {
  const routeParams = useParams();
  const nav = useNavigate();

  const [showCartaPagadaModal, setShowCartaPagadaModal] = useState(false);
  const [showSwiftModal, setShowSwiftModal] = useState(false);

  const dispatch = useAppDispatch();

  const [getCartaComercial, { data: cartaCreditoDetalle, isLoading }] = useLazyGetCartaComercialQuery();
  const [updateEstatus, { data: updatedCartaCredito, isSuccess: updateEstatusSuccess, isError: updateEstatusError }] = useUpdateCartaComercialEstatusMutation();
  const [clonarCarta, { data: clonData, isSuccess: clonSuccess, isError: clonError }] = useClonarCartaComercialMutation();
  const [getSwiftBase64, { data: swiftRsp, isSuccess: isSwiftSuccess, isError: isSwiftError }] = useLazyGetSwiftBase64Query();

  const _handleClickOpenSwift = (cartaCreditoDetalle: ICartaComercial) => {
    if (cartaCreditoDetalle.Id) {
      getSwiftBase64(cartaCreditoDetalle.Id);
    }
  };

  const _handleBack = useCallback(() => {
    nav(`/operaciones/cartas-de-credito`);
  }, []);

  const _handleClonar = useCallback(() => {
    if (routeParams.cartaCreditoId) {
      clonarCarta({ CartaCreditoId: routeParams.cartaCreditoId });
    } else {
      dispatch(
        addToast({
          title: "Error",
          message: "No hay información de carta de crédito",
          type: "error",
        })
      );
    }
  }, [routeParams]);

  useEffect(() => {
    if (routeParams.cartaCreditoId) {
      getCartaComercial(routeParams.cartaCreditoId);
    }
  }, [routeParams]);

  useEffect(() => {
    if (isSwiftSuccess && swiftRsp && swiftRsp.DataString) {
      const linkSource = `data:application/pdf;base64,${swiftRsp.DataString}`;
      const downloadLink = document.createElement("a");
      const fileName = `${cartaCreditoDetalle?.NumCartaCredito || "swift"}.pdf`;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }

    if (isSwiftError) {
      dispatch(
        addToast({
          title: "Error",
          message: "Ocurrió un error al descargar Swift",
          type: "error",
        })
      );
    }
  }, [isSwiftSuccess, isSwiftError, swiftRsp])


  useEffect(() => {
    if (clonSuccess) {
      if (clonData && clonData.Flag === true) {
        dispatch(
          addToast({
            title: "Éxito",
            message: "Nueva carta de crédito creada. Redirigiendo...",
            type: "success",
          })
        );
        if (cartaCreditoDetalle && cartaCreditoDetalle.TipoCarta === "StandBy") {
          nav(`/operaciones/cartas-de-credito/${clonData.DataString}/editar-standby`);
        } else {
          nav(`/operaciones/cartas-de-credito/${clonData.DataString}/editar`);
        }
      }

      if (clonData && clonData.Flag === false) {
        dispatch(
          addToast({
            title: "Error",
            message: clonData.Errors ? clonData.Errors[0] : "Ocurrió un error",
            type: "error",
          })
        );
      }
    }

    if (clonError) {
      dispatch(
        addToast({
          title: "Error",
          message: "Ocurrió un error al clonar la carta de crédito",
          type: "error",
        })
      );
    }
  }, [clonSuccess, clonError, clonData]);

  useEffect(() => {
    if (updateEstatusSuccess) {
      if (updatedCartaCredito) {
        if (updatedCartaCredito.Errors && updatedCartaCredito.Errors.length > 0) {
          dispatch(
            addToast({
              title: "Error",
              message: "Ocurrió un problema al actualizar",
              type: "error",
            })
          );
        } else {
          dispatch(
            addToast({
              title: "Éxito",
              message: "El estatus ha sido cambiado",
              type: "success",
            })
          );
          setShowCartaPagadaModal(false);
        }
      } else {
        dispatch(
          addToast({
            title: "Error",
            message: "Ocurrió un problema al actualizar",
            type: "error",
          })
        );
      }
    }

    if (updateEstatusError) {
      dispatch(
        addToast({
          title: "Error",
          message: "Ocurrió un problema al actualizar",
          type: "error",
        })
      );
    }
  }, [updateEstatusSuccess, updateEstatusError, updatedCartaCredito]);

  if (isLoading || !cartaCreditoDetalle) {
    return <AdminLoadingActivity />;
  }

  if (cartaCreditoDetalle && cartaCreditoDetalle.TipoCarta === "StandBy") {
    return (
      <>
        <div className="p-6">
          <div className="mb-4">
            <AdminBreadcrumbs
              links={[
                { name: "Operaciones", href: "#" },
                {
                  name: "Cartas de Crédito",
                  href: `${apiHost}/#/operaciones/cartas-de-credito`,
                },
                { name: "Detalle de Carta", href: `${apiHost}/#/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}` },
              ]}
            />
          </div>
          <div className="mb-4">
            <AdminPageHeader title="Cartas de Crédito" subtitle="Detalle de Carta de Crédito" icon={faFileInvoiceDollar} />
          </div>

          <div className="">
            <Button outline color="dark" size="xs" onClick={_handleBack}>
              <FontAwesomeIcon icon={faCircleArrowLeft} className="mr-2" />
              Regresar
            </Button>
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-4 mb-6 px-6">
          <div className="col-span-3">{cartaCreditoDetalle && cartaCreditoDetalle.Estatus && <EstatusButton estatus={cartaCreditoDetalle.Estatus} />}</div>
          <div className="col-span-9 flex justify-end gap-4 items-center">
            <Button className="bg-brandPrimary hover:bg-brandDark rounded-md" size="sm" onClick={() => _handleClonar()}>
              Usar Como Plantilla
            </Button>

            {cartaCreditoDetalle && cartaCreditoDetalle.DocumentoSwift !== "" && (
              <a
                className="bg-brandPrimary p-2 rounded text-sm"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  _handleClickOpenSwift(cartaCreditoDetalle);
                }}>
                <span className="text-white">Descargar Archivo Swift</span>
              </a>
            )}
          </div>
        </div>

        <form className="pb-24">
          <div className="md:grid md:grid-cols-12 md:gap-4 mb-6 px-6">
            <div className="md:col-span-3">
              <Label value="No. Carta de Crédito:" />
              <TextInput type="text" name="numCarta" value={cartaCreditoDetalle.NumCartaCredito} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Tipo de Carta:" />
              <TextInput type="text" value={cartaCreditoDetalle.TipoCarta} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Tipo de StandBy:" />
              <TextInput type="text" value={cartaCreditoDetalle.TipoStandBy || ""} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Banco:" />
              <TextInput type="text" value={cartaCreditoDetalle.Banco} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Empresa:" />
              <TextInput type="text" value={cartaCreditoDetalle.Empresa} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Moneda:" />
              <TextInput type="text" value={cartaCreditoDetalle.Moneda} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Comprador:" />
              <TextInput type="text" value={cartaCreditoDetalle.Comprador} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Monto Original L/C:" />
              <TextInput type="text" value={numeral(cartaCreditoDetalle.MontoOriginalLC).format("$0,0.00")} disabled readOnly />
            </div>
            <div className="md:col-span-3">
              <Label value="Fecha de Apertura:" />
              <TextInput type="text" value={cartaCreditoDetalle.FechaApertura?.toString()} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Fecha Límite de Embarque:" />
              <TextInput type="text" value={cartaCreditoDetalle.FechaLimiteEmbarque?.toString()} disabled />
            </div>
            <div className="md:col-span-3">
              <Label value="Fecha de Vencimiento:" />
              <TextInput type="text" value={cartaCreditoDetalle.FechaVencimiento?.toString()} disabled />
            </div>
          </div>

          <div className="bg-yellow-50 py-6 px-6">
            <div className="mb-4">
              <Label value="Consideraciones Generales de Reclamación:" />
              <Textarea disabled value={cartaCreditoDetalle.ConsideracionesReclamacion ? cartaCreditoDetalle.ConsideracionesReclamacion : ""} />
            </div>

            <div className="mb-4">
              <Label value="Consideraciones adicionales:" />
              <Textarea disabled value={cartaCreditoDetalle.ConsideracionesAdicionales ? cartaCreditoDetalle.ConsideracionesAdicionales : ""} />
            </div>
          </div>
        </form>

        <div id="controles-footer" className="fixed bottom-0 left-0 w-full bg-brandPrimary p-6 text-white flex items-center justify-center gap-12">
          {/* <a href="#" className="flex flex-col items-center justify-around gap-2">
          <FontAwesomeIcon icon={faPencil} className="h-6" />
          <span className="text-sm">Editar Solicitud</span>
        </a>
        */}
          {cartaCreditoDetalle && cartaCreditoDetalle.Estatus && Number(cartaCreditoDetalle.Estatus) === 1 && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowSwiftModal(true);
              }}
              className="flex flex-col items-center justify-around gap-2">
              <FontAwesomeIcon icon={faUpload} className="h-6 text-white" />
              <span className="text-xs text-white">Archivo Swift</span>
            </a>
          )}

          {cartaCreditoDetalle && cartaCreditoDetalle.Estatus && Number(cartaCreditoDetalle.Estatus) > 1 && (
            <>
              <Link to={`/operaciones/cartas-de-credito/${cartaCreditoDetalle.Id}/pagos`} className="flex flex-col items-center justify-around gap-2">
                <FontAwesomeIcon icon={faDollarSign} className="h-6 text-white" />
                <span className="text-xs text-white">Registro de Pagos</span>
              </Link>
              <Link to={`/operaciones/cartas-de-credito/${cartaCreditoDetalle.Id}/comisiones`} className="flex flex-col items-center justify-around gap-2">
                <FontAwesomeIcon icon={faPlusCircle} className="h-6 text-white" />
                <span className="text-xs text-white">Registro de Comisiones</span>
              </Link>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCartaPagadaModal(true);
                }}
                className="flex flex-col items-center justify-around gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="h-6 text-white" />
                <span className="text-xs text-white">Registrar como Pagada</span>
              </a>
            </>
          )}

          {cartaCreditoDetalle && cartaCreditoDetalle.Estatus && Number(cartaCreditoDetalle.Estatus) !== 21 && (
            <Link to={`/operaciones/cartas-de-credito/${cartaCreditoDetalle.Id}/enmiendas`} className="flex flex-col items-center justify-around gap-2">
              <FontAwesomeIcon icon={faFilePen} className="h-6 text-white" />
              <span className="text-xs text-white">Registrar Enmienda</span>
            </Link>
          )}

          {cartaCreditoDetalle && cartaCreditoDetalle.Estatus && Number(cartaCreditoDetalle.Estatus) === 21 && (
            <Link to={`/operaciones/cartas-de-credito/${cartaCreditoDetalle.Id}/enmiendas`} className="flex flex-col items-center justify-around gap-2">
              <FontAwesomeIcon icon={faFilePen} className="h-6 text-white" />
              <span className="text-xs text-white">Enmienda Pendiente</span>
            </Link>
          )}

          <Link to={`/imprimir/cartas-de-credito/${cartaCreditoDetalle.Id}`} className="flex flex-col items-center justify-around gap-2" target="_blank">
            <FontAwesomeIcon icon={faPrint} className="h-6 text-white" />
            <span className="text-sm text-white">Imprimir</span>
          </Link>
        </div>

        {cartaCreditoDetalle && cartaCreditoDetalle.Id && (
          <CartaSwiftModal show={showSwiftModal} handleClose={() => setShowSwiftModal(false)} cartaCreditoId={cartaCreditoDetalle.Id} />
        )}

        <Modal dismissible={true} show={showCartaPagadaModal} onClose={() => setShowCartaPagadaModal(false)}>
          <Modal.Header>Confirmar</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              {updatedCartaCredito &&
                updatedCartaCredito.Errors &&
                updatedCartaCredito.Errors.map((item, index) => (
                  <Alert key={index.toString()} color="failure" className="mb-6">
                    <span>
                      <span className="font-medium">Información</span> {item}
                    </span>
                  </Alert>
                ))}
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer. ¿Está seguro de continuar?</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button className="bg-brandPrimary hover:bg-brandDark" onClick={() => updateEstatus({ ...cartaCreditoDetalle, Estatus: 4 })}>
              Continuar
            </Button>
            <Button color="gray" onClick={() => setShowCartaPagadaModal(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="mb-4">
          <AdminBreadcrumbs
            links={[
              { name: "Operaciones", href: "#" },
              {
                name: "Cartas de Crédito",
                href: `${apiHost}/#/operaciones/cartas-de-credito`,
              },
              { name: "Detalle de Carta", href: `${apiHost}/#/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}` },
            ]}
          />
        </div>
        <div className="mb-4">
          <AdminPageHeader title="Cartas de Crédito" subtitle="Detalle de Carta de Crédito" icon={faFileInvoiceDollar} />
        </div>

        <div className="">
          <Button outline color="dark" size="xs" onClick={_handleBack}>
            <FontAwesomeIcon icon={faCircleArrowLeft} className="mr-2" />
            Regresar
          </Button>
        </div>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-4 mb-6 px-6">
        <div className="col-span-3">{cartaCreditoDetalle && cartaCreditoDetalle.Estatus && <EstatusButton estatus={cartaCreditoDetalle.Estatus} />}</div>
        <div className="col-span-9 flex justify-end gap-4 items-center">
          <Button className="bg-brandPrimary hover:bg-brandDark rounded-md" size="sm" onClick={() => _handleClonar()}>
            Usar Como Plantilla
          </Button>

          {cartaCreditoDetalle && cartaCreditoDetalle.DocumentoSwift !== "" && (
            <a
              className="bg-brandPrimary p-2 rounded text-sm"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                _handleClickOpenSwift(cartaCreditoDetalle);
              }}>
              <span className="text-white">Descargar Archivo Swift</span>
            </a>
          )}
        </div>
      </div>

      <form className="pb-24">
        <div className="md:grid md:grid-cols-12 md:gap-4 mb-6 px-6">
          <div className="md:col-span-3">
            <Label value="No. Carta de Crédito:" />
            <TextInput type="text" name="numCarta" value={cartaCreditoDetalle.NumCartaCredito} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Tipo de Carta:" />
            <TextInput type="text" value={cartaCreditoDetalle.TipoCarta} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Tipo de Activo:" />
            <TextInput type="text" value={cartaCreditoDetalle.TipoActivo} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Proyecto:" />
            <TextInput type="text" value={cartaCreditoDetalle.Proyecto} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Banco:" />
            <TextInput type="text" value={cartaCreditoDetalle.Banco} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Proveedor:" />
            <TextInput type="text" value={cartaCreditoDetalle.Proveedor} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Empresa:" />
            <TextInput type="text" value={cartaCreditoDetalle.Empresa} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Agente Aduanal:" />
            <TextInput type="text" value={cartaCreditoDetalle.AgenteAduanal} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Moneda:" />
            <TextInput type="text" value={cartaCreditoDetalle.Moneda} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Tipo de Pago:" />
            <TextInput type="text" value={cartaCreditoDetalle.TipoPago} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Responsable:" />
            <TextInput type="text" value={cartaCreditoDetalle.Responsable} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Comprador:" />
            <TextInput type="text" value={cartaCreditoDetalle.Comprador} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="% Tolerancia:" />
            <TextInput type="text" value={cartaCreditoDetalle.PorcentajeTolerancia} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="No. Orden de Compra:" />
            <TextInput type="text" value={cartaCreditoDetalle.NumOrdenCompra} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Costo de Apertura:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.CostoApertura).format("$0,0.00")} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Monto Orden de Compra:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.MontoOrdenCompra).format("$0,0.00")} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Monto Original L/C:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.MontoOriginalLC).format("$0,0.00")} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Pagos Efectuados:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.PagosEfectuados).format("$0,0.00")} disabled readOnly />
          </div>
          <div className="md:col-span-3">
            <Label value="Pagos Programados:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.PagosProgramados).format("$0,0.00")} disabled readOnly />
          </div>
          <div className="md:col-span-3">
            <Label value="Monto Dispuesto:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.MontoDispuesto).format("$0,0.00")} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Saldo Insoluto:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.SaldoInsoluto).format("$0,0.00")} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Fecha de Apertura:" />
            <TextInput type="text" value={cartaCreditoDetalle.FechaApertura?.toString()} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Icoterm:" />
            <TextInput type="text" value={cartaCreditoDetalle.Incoterm?.toString()} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Fecha Límite de Embarque:" />
            <TextInput type="text" value={cartaCreditoDetalle.FechaLimiteEmbarque?.toString()} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Fecha de Vencimiento:" />
            <TextInput type="text" value={cartaCreditoDetalle.FechaVencimiento?.toString()} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Embarques Parciales:" />
            <TextInput type="text" value={cartaCreditoDetalle.EmbarquesParciales} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Transbordos:" />
            <TextInput type="text" value={cartaCreditoDetalle.Transbordos} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Punto de Embarque:" />
            <TextInput type="text" value={cartaCreditoDetalle.PuntoEmbarque} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Punto de Desembarque:" />
            <TextInput type="text" value={cartaCreditoDetalle.PuntoDesembarque} disabled />
          </div>
        </div>

        <div className="bg-yellow-50 py-6 px-6">
          <div className="mb-4">
            <Label value="Descripción de Mercancía:" />
            <Textarea disabled value={cartaCreditoDetalle.DescripcionMercancia ? cartaCreditoDetalle.DescripcionMercancia : ""} />
          </div>

          <div className="mb-4">
            <Label value="Descripción de la carta de crédito:" />
            <Textarea disabled value={cartaCreditoDetalle.DescripcionCartaCredito ? cartaCreditoDetalle.DescripcionCartaCredito : ""} />
          </div>

          <div className="mb-4">
            <Label value="Pago vs carta de aceptación:" />
            <Textarea disabled value={cartaCreditoDetalle.PagoCartaAceptacion ? cartaCreditoDetalle.PagoCartaAceptacion : ""} />
          </div>

          <div className="mb-4">
            <Label value="Consignación de mercancía:" />
            <Textarea disabled value={cartaCreditoDetalle.ConsignacionMercancia ? cartaCreditoDetalle.ConsignacionMercancia : ""} />
          </div>

          <div className="mb-4">
            <Label value="Consideraciones adicionales:" />
            <Textarea disabled value={cartaCreditoDetalle.ConsideracionesAdicionales ? cartaCreditoDetalle.ConsideracionesAdicionales : ""} />
          </div>

          <div className="mb-4">
            <Label value="Instrucciones Especiales:" />
            <Textarea disabled value={cartaCreditoDetalle.InstruccionesEspeciales ? cartaCreditoDetalle.InstruccionesEspeciales : ""} />
          </div>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-4 mb-6 p-6">
          <div className="md:col-span-3">
            <Label value="Días para presentar documentos:" />
            <TextInput type="text" value={cartaCreditoDetalle.DiasParaPresentarDocumentos} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Días de plazo proveedor:" />
            <TextInput type="text" value={cartaCreditoDetalle.DiasPlazoProveedor} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Condiciones de pago:" />
            <TextInput type="text" value={cartaCreditoDetalle.CondicionesPago} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Número de periodos:" />
            <TextInput type="text" value={cartaCreditoDetalle.NumeroPeriodos} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Banco Corresponsal:" />
            <TextInput type="text" value={cartaCreditoDetalle.BancoCorresponsal} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Seguro por Cuenta:" />
            <TextInput type="text" value={cartaCreditoDetalle.SeguroPorCuenta} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Gastos y Comisiones de Corresponsal:" />
            <TextInput type="text" value={cartaCreditoDetalle.GastosComisionesCorresponsal} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Confirmar Banco Notificador" />
            <TextInput type="text" value={cartaCreditoDetalle.ConfirmacionBancoNotificador} disabled />
          </div>
          <div className="md:col-span-3">
            <Label value="Tipo de Emisión" />
            <TextInput type="text" value={cartaCreditoDetalle.TipoEmision} disabled />
          </div>
        </div>
      </form>

      <div id="controles-footer" className="fixed bottom-0 left-0 w-full bg-brandPrimary p-6 text-white flex items-center justify-center gap-12">
        {/* <a href="#" className="flex flex-col items-center justify-around gap-2">
          <FontAwesomeIcon icon={faPencil} className="h-6" />
          <span className="text-sm">Editar Solicitud</span>
        </a>
        */}
        {cartaCreditoDetalle && cartaCreditoDetalle.Estatus && Number(cartaCreditoDetalle.Estatus) === 1 && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowSwiftModal(true);
            }}
            className="flex flex-col items-center justify-around gap-2">
            <FontAwesomeIcon icon={faUpload} className="h-6 text-white" />
            <span className="text-xs text-white">Archivo Swift</span>
          </a>
        )}

        {cartaCreditoDetalle && cartaCreditoDetalle.Estatus && Number(cartaCreditoDetalle.Estatus) > 1 && (
          <>
            <Link to={`/operaciones/cartas-de-credito/${cartaCreditoDetalle.Id}/pagos`} className="flex flex-col items-center justify-around gap-2">
              <FontAwesomeIcon icon={faDollarSign} className="h-6 text-white" />
              <span className="text-xs text-white">Registro de Pagos</span>
            </Link>
            <Link to={`/operaciones/cartas-de-credito/${cartaCreditoDetalle.Id}/comisiones`} className="flex flex-col items-center justify-around gap-2">
              <FontAwesomeIcon icon={faPlusCircle} className="h-6 text-white" />
              <span className="text-xs text-white">Registro de Comisiones</span>
            </Link>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowCartaPagadaModal(true);
              }}
              className="flex flex-col items-center justify-around gap-2">
              <FontAwesomeIcon icon={faCheckCircle} className="h-6 text-white" />
              <span className="text-xs text-white">Registrar como Pagada</span>
            </a>
          </>
        )}

        {cartaCreditoDetalle && cartaCreditoDetalle.Estatus && Number(cartaCreditoDetalle.Estatus) !== 21 && (
          <Link to={`/operaciones/cartas-de-credito/${cartaCreditoDetalle.Id}/enmiendas`} className="flex flex-col items-center justify-around gap-2">
            <FontAwesomeIcon icon={faFilePen} className="h-6 text-white" />
            <span className="text-xs text-white">Registrar Enmienda</span>
          </Link>
        )}

        {cartaCreditoDetalle && cartaCreditoDetalle.Estatus && Number(cartaCreditoDetalle.Estatus) === 21 && (
          <Link to={`/operaciones/cartas-de-credito/${cartaCreditoDetalle.Id}/enmiendas`} className="flex flex-col items-center justify-around gap-2">
            <FontAwesomeIcon icon={faFilePen} className="h-6 text-white" />
            <span className="text-xs text-white">Enmienda Pendiente</span>
          </Link>
        )}

        <Link to={`/imprimir/cartas-de-credito/${cartaCreditoDetalle.Id}`} className="flex flex-col items-center justify-around gap-2" target="_blank">
          <FontAwesomeIcon icon={faPrint} className="h-6 text-white" />
          <span className="text-sm text-white">Imprimir</span>
        </Link>
      </div>

      {cartaCreditoDetalle && cartaCreditoDetalle.Id && (
        <CartaSwiftModal show={showSwiftModal} handleClose={() => setShowSwiftModal(false)} cartaCreditoId={cartaCreditoDetalle.Id} />
      )}

      <Modal dismissible={true} show={showCartaPagadaModal} onClose={() => setShowCartaPagadaModal(false)}>
        <Modal.Header>Confirmar</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            {updatedCartaCredito &&
              updatedCartaCredito.Errors &&
              updatedCartaCredito.Errors.map((item, index) => (
                <Alert key={index.toString()} color="failure" className="mb-6">
                  <span>
                    <span className="font-medium">Información</span> {item}
                  </span>
                </Alert>
              ))}
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer. ¿Está seguro de continuar?</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="bg-brandPrimary hover:bg-brandDark" onClick={() => updateEstatus({ ...cartaCreditoDetalle, Estatus: 4 })}>
            Continuar
          </Button>
          <Button color="gray" onClick={() => setShowCartaPagadaModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
