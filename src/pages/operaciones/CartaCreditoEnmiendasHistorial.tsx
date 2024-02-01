import { useLazyGetCartaComercialQuery } from "@/apis";
import { AdminLoadingActivity, AdminBreadcrumbs, AdminPageHeader } from "@/components";
import { useAppDispatch } from "@/store";
import { apiHost } from "@/utils/apiConfig";
import { faFileInvoiceDollar, faCircleArrowLeft, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Card, Label, TextInput, Textarea } from "flowbite-react";
import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import numeral from "numeral";
import { useAddEnmiendaMutation, useApproveEnmiendaMutation } from "@/apis/enmiendasApi";
import { DataGrid } from "devextreme-react";
import { Column, Export, HeaderFilter, Paging, SearchPanel, Selection } from "devextreme-react/data-grid";

const txtsExport = {
  exportAll: "Exportar Todo",
  exportSelectedRows: "Exportar Selección",
  exportTo: "Exportar A",
};

export const CartaCreditoEnmiendasHistorial = () => {
  const routeParams = useParams();
  const nav = useNavigate();

  const dispatch = useAppDispatch();

  const [getCartaComercial, { data: cartaCreditoDetalle, isLoading, isSuccess: isGetDetalleSuccess }] = useLazyGetCartaComercialQuery();
  const [addEnmienda, { data, isSuccess, isError }] = useAddEnmiendaMutation();
  const [approveEnmienda, { data: approveData, isSuccess: approveIsSuccess, isError: approveIsError }] = useApproveEnmiendaMutation();

  const _handleDetalle = useCallback(() => {
    nav(`/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}`);
  }, [cartaCreditoDetalle]);

  const _handleRegistroEnmienda = useCallback(() => {
    nav(`/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}/enmiendas`);
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
      <div className="p-6 text-sm">
        <div className="mb-4">
          <AdminBreadcrumbs
            links={[
              { name: "Operaciones", href: "#" },
              { name: "Cartas de Crédito", href: `${apiHost}/#/operaciones/cartas-de-credito` },
              { name: "Detalle de Carta", href: `${apiHost}/#/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}` },
              { name: "Enmiendas", href: "#" },
            ]}
          />
        </div>
        <div className="mb-4">
          <AdminPageHeader title="Cartas de Crédito" subtitle="Historial de Emiendas" icon={faFileInvoiceDollar} />
        </div>

        <div className="mb-4 flex items-center justify-start gap-4">
          <Button outline color="dark" size="xs" onClick={_handleDetalle}>
            <FontAwesomeIcon icon={faCircleArrowLeft} className="mr-2" />
            Detalle de Carta
          </Button>

          <Button outline color="dark" size="xs" onClick={_handleRegistroEnmienda}>
            <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
            Registro de Enmienda
          </Button>
        </div>

        <div className="mb-4">
          <DataGrid showBorders={true} showColumnLines={true} showRowLines={true} keyExpr="Id" dataSource={cartaCreditoDetalle.Enmiendas}>
            <Paging defaultPageSize={10} />
            <HeaderFilter visible={true} />
            <SearchPanel visible={true} />
            <Selection mode="multiple" showCheckBoxesMode="always" />
            <Export enabled={true} texts={txtsExport} allowExportSelectedData={true} />
            <Column dataField="DocumentoSwift" />
            <Column dataField="ImporteLC" caption="Monto Original LC" format="currency" dataType="number" alignment="right" />
            <Column
              dataField="FechaLimiteEmbarque"
              caption="Fecha Límite de Embarque"
              dataType="datetime"
              format="dd/MM/yyyy"
              defaultSortOrder="asc"
              sortIndex={0}
            />
            <Column dataField="FechaVencimiento" caption="Fecha Vencimiento" dataType="datetime" format="dd/MM/yyyy" defaultSortOrder="asc" sortIndex={0} />
            <Column dataField="Creado" caption="Fecha de Registro" dataType="datetime" format="dd/MM/yyyy" defaultSortOrder="asc" sortIndex={0} />
            {/* <Column dataField="NumCartaCredito" /> */}
          </DataGrid>
        </div>
      </div>
    </>
  );
};
