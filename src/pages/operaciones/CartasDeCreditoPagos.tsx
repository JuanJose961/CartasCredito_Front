import { useLazyGetCartaComercialQuery, useUpdateCartaComercialEstatusMutation } from "@/apis/cartasCreditoApi";
import { AdminBreadcrumbs, AdminLoadingActivity, AdminPageHeader, CartaPagoManualModal, CartaPagoModal, CartaSwiftModal } from "@/components";
import { useAppDispatch } from "@/store";
import { addToast } from "@/store/uiSlice";
import { faFileInvoiceDollar, faCircleArrowLeft, faUpload, faDollarSign, faCheckCircle, faFileCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Label, Modal, TextInput, Textarea, Table, Checkbox, Radio } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import numeral from "numeral";
import { EstatusButton } from "./CartasDeCreditoDetalle";
import { IPago } from "@/interfaces";
import { apiHost } from "@/utils/apiConfig";
import es from "date-fns/locale/es";
import { format } from "date-fns";
const locale = es;

export const CartasDeCreditoPagos = () => {
  const routeParams = useParams();
  const nav = useNavigate();

  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showPagoManualModal, setShowPagoManualModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState<IPago | null>(null);
  const [selectedPagoMonto, setSelectedPagoMonto] = useState(0);

  const [getCartaComercial, { data: cartaCreditoDetalle, isLoading }] = useLazyGetCartaComercialQuery();

  const _handleBack = useCallback(() => {
    nav(`/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}`);
  }, [cartaCreditoDetalle]);

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
      <div className="p-6">
        <div className="mb-4">
          <AdminBreadcrumbs
            links={[
              { name: "Operaciones", href: "#" },
              { name: "Cartas de Crédito", href: `${apiHost}/#/operaciones/cartas-de-credito` },
              { name: "Detalle de Carta", href: `${apiHost}/#/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}` },
              { name: "Pagos", href: "#" },
            ]}
          />
        </div>
        <div className="mb-4">
          <AdminPageHeader title="Cartas de Crédito" subtitle="Pagos" icon={faFileInvoiceDollar} />
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
        <div className="col-span-3 text-right">
          {/* @if (Model.DocumentoSwift != "")
                    {
                        <a target="_blank" className="btn btn-dark" href="@Utility.HostUrl/Uploads/@Model.DocumentoSwift">Descargar Archivo Swift</a>
                    } */}
          {/* <button type="submit" className="btn btn-dark">
            Clonar
          </button> */}
        </div>
      </div>

      <form className="mb-12">
        <div className="md:grid md:grid-cols-10 md:gap-4 mb-6 px-6">
          <div className="md:col-span-2">
            <Label value="Fecha de Apertura:" />
            <TextInput type="text" defaultValue={cartaCreditoDetalle.FechaApertura} disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="No. Carta de Crédito:" />
            <TextInput type="text" name="numCarta" defaultValue={cartaCreditoDetalle.NumCartaCredito} disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="Tipo de Carta:" />
            <TextInput type="text" defaultValue={cartaCreditoDetalle.TipoCarta} disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="Banco:" />
            <TextInput type="text" defaultValue={cartaCreditoDetalle.Banco} disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="Proveedor:" />
            <TextInput type="text" defaultValue={cartaCreditoDetalle.Proveedor} disabled />
          </div>
        </div>
        <div className="md:grid md:grid-cols-12 md:gap-4 mb-6 px-6">
          <div className="md:col-span-2">
            <Label value="Empresa:" />
            <TextInput type="text" defaultValue={cartaCreditoDetalle.Empresa} disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="Moneda:" />
            <TextInput type="text" defaultValue={cartaCreditoDetalle.Moneda} disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="Monto Original L/C:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.MontoOriginalLC).format("$0,0.00")} readOnly disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="Pagos Efectuados:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.PagosEfectuados).format("$0,0.00")} readOnly disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="Pagos Programados:" />
            <TextInput type="text" value={numeral(cartaCreditoDetalle.PagosProgramados).format("$0,0.00")} readOnly disabled />
          </div>
          <div className="md:col-span-2">
            <Label value="Pagos Cancelados:" />
            <TextInput type="text" value="0.00" readOnly disabled />
          </div>
        </div>
      </form>

      <div className="mb-6 flex items-center justify-start gap-6 px-6">
        <div className="flex items-center justify-start gap-2">
          <div className="w-6 h-6 bg-yellow-100"></div>
          <span className="text-sm">Registrado</span>
        </div>
        <div className="flex items-center justify-start gap-2">
          <div className="w-6 h-6 bg-green-300"></div>
          <span className="text-sm">Pagado</span>
        </div>
      </div>

      <div className="my-6 px-6 pb-24">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>&nbsp;</Table.HeadCell>
            <Table.HeadCell>No. Pago</Table.HeadCell>
            <Table.HeadCell>Fecha Vencimiento</Table.HeadCell>
            <Table.HeadCell align="right">Monto de Pago</Table.HeadCell>
            <Table.HeadCell>Fecha de Pago</Table.HeadCell>
            <Table.HeadCell align="right">Monto Pagado</Table.HeadCell>
            <Table.HeadCell>No. Factura</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {cartaCreditoDetalle?.Pagos &&
              cartaCreditoDetalle.Pagos.map((item, index) => (
                <Table.Row
                  key={index.toString()}
                  onClick={(e) => {
                    setSelectedPago(item);
                    setSelectedPagoMonto(item.MontoPago || 0);
                  }}>
                  <Table.Cell className={item.EstatusClass ? item.EstatusClass : ""}>
                    <Radio value={item.Id} onChange={(e) => setSelectedPago(item)} checked={selectedPago?.Id === item.Id} />
                  </Table.Cell>
                  <Table.Cell>{item.NumeroPago}</Table.Cell>
                  <Table.Cell>{format(new Date(item.FechaVencimiento), "dd-MMMM-yyyy", { locale })}</Table.Cell>
                  <Table.Cell align="right">{numeral(item.MontoPago).format("$0,0.00")}</Table.Cell>
                  <Table.Cell>{item.FechaPago && format(new Date(item.FechaPago), "dd-MMMM-yyyy", { locale })}</Table.Cell>
                  <Table.Cell align="right">{numeral(item.MontoPagado).format("$0,0.00")}</Table.Cell>
                  <Table.Cell>{item.NumeroFactura}</Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </div>

      <div id="controles-footer" className="fixed bottom-0 left-0 w-full bg-brandPrimary p-6 text-white flex items-center justify-center gap-12">
        <a
          href="#"
          className="flex flex-col items-center justify-around gap-2"
          onClick={(e) => {
            e.preventDefault();
            setShowPagoModal(true);
          }}>
          <FontAwesomeIcon icon={faFileCirclePlus} className="h-6 text-white" />
          <span className="text-sm text-white">Nuevo Pago</span>
        </a>

        {selectedPago !== null && selectedPago.Estatus !== null && selectedPago.Estatus < 3 && (
          <>
            <a
              href="#"
              className="flex flex-col items-center justify-around gap-2"
              onClick={(e) => {
                e.preventDefault();
                setShowPagoManualModal(true);
              }}>
              <FontAwesomeIcon icon={faCheckCircle} className="h-6 text-white" />
              <span className="text-sm text-white">Registro Manual</span>
            </a>
          </>
        )}

        {/* <a href="#" className="flex flex-col items-center justify-around gap-2">
          <FontAwesomeIcon icon={faPlusCircle} className="h-6 text-white" />
          <span className="text-sm text-white">Comisiones</span>
        </a>  */}
      </div>

      {cartaCreditoDetalle && cartaCreditoDetalle.Id && (
        <CartaPagoModal show={showPagoModal} handleClose={() => setShowPagoModal(false)} cartaCreditoId={cartaCreditoDetalle.Id} />
      )}
      {cartaCreditoDetalle && cartaCreditoDetalle.Id && selectedPago && (
        <CartaPagoManualModal
          moneda={cartaCreditoDetalle.Moneda ? cartaCreditoDetalle.Moneda : ""}
          show={showPagoManualModal}
          handleClose={() => setShowPagoManualModal(false)}
          pagoId={selectedPago.Id}
          monto={selectedPagoMonto}
          setMonto={(monto) => {
            setSelectedPagoMonto(monto);
          }}
        />
      )}
    </>
  );
};
