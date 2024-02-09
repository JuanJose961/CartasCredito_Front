import { useGetBancosQuery } from "@/apis/bancosApi";
import { useGetEmpresasQuery } from "@/apis/empresasApi";
import { useAddLineaDeCreditoMutation, useGetLineasDeCreditoQuery, useToggleLineaDeCreditoMutation, useUpdateLineaDeCreditoMutation } from "@/apis/lineasDeCreditoApi";
import { AdminBreadcrumbs, AdminPageHeader } from "@/components";
import { useAppDispatch } from "@/store";
import { addToast } from "@/store/uiSlice";
import { apiHost } from "@/utils/apiConfig";
import { faPencil, faPlusCircle, faRectangleList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Label, Modal, Select, Table, Textarea, TextInput, ToggleSwitch, Tooltip } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import DataGrid, { Column, Export, HeaderFilter, Paging, SearchPanel, Selection } from "devextreme-react/data-grid";
import { ColumnCellTemplateData } from "devextreme/ui/data_grid";

const txtsExport = {
  exportAll: "Exportar Todo",
  exportSelectedRows: "Exportar Selección",
  exportTo: "Exportar A",
};

export const LineasDeCredito = () => {
  const { data: catalogoData, isLoading, error } = useGetLineasDeCreditoQuery();
  const [addModelo, { isLoading: isAdding, error: addError, data: rsp }] = useAddLineaDeCreditoMutation();
  const [updateModelo, { data: updateRsp, isSuccess: updateSuccess }] = useUpdateLineaDeCreditoMutation();
  const [toggleModelo, { data: toggleRsp, isSuccess: toggleSuccess }] = useToggleLineaDeCreditoMutation();

  const { data: empresasCat } = useGetEmpresasQuery();
  const { data: bancosCat } = useGetBancosQuery();

  const dispatch = useAppDispatch();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(0);

  const [bancoId, setBancoId] = useState(0);
  const [empresaId, setEmpresaId] = useState(0);
  const [monto, setMonto] = useState(0);
  const [cuenta, setCuenta] = useState("");

  const _reset = useCallback(() => {
    setEditId(0);
    setBancoId(0);
    setEmpresaId(0);
    setMonto(0);
    setCuenta("");
  }, [editId, bancoId, empresaId, monto, cuenta]);

  const _handleShowModal = useCallback(() => {
    setEditId(0);
    setBancoId(0);
    setEmpresaId(0);
    setMonto(0);
    setCuenta("");
    setShowAddForm(true);
  }, [showAddForm]);

  const _handleHideModal = useCallback(() => {
    setShowAddForm(false);
  }, [showAddForm]);

  const _handleToggleActivo = useCallback((modelId: number) => {
    toggleModelo(modelId);
  }, []);

  const _handleEdit = (modelId: number) => {
    let editModel = catalogoData?.find((i) => i.Id === modelId);

    if (editModel) {
      setEditId(editModel.Id);
      setBancoId(editModel.BancoId);
      setEmpresaId(editModel.EmpresaId);
      setMonto(editModel.Monto);
      setCuenta(editModel.Cuenta);
      setShowAddForm(true);
    } else {
      dispatch(addToast({ title: "Ocurrió un Error", message: "No se encuentra el elemento", type: "error" }));
    }
  };

  const _handleSubmit = useCallback(() => {
    if (editId > 0) {
      updateModelo({ Id: editId, BancoId: bancoId, EmpresaId: empresaId, Monto: monto, Cuenta: cuenta });
    } else {
      addModelo({ BancoId: bancoId, EmpresaId: empresaId, Monto: monto, Cuenta: cuenta });
    }
  }, [editId, bancoId, empresaId, monto, cuenta]);

  useEffect(() => {
    if (rsp && rsp.DataInt !== null && rsp.DataInt > 0) {
      dispatch(addToast({ title: "Éxito", message: "Registro agregado con éxito", type: "success" }));
      _reset();
      setShowAddForm(false);
    }

    if (updateRsp && updateRsp.DataInt !== null && updateRsp.DataInt > 0) {
      dispatch(addToast({ title: "Éxito", message: "Registro actualizado con éxito", type: "success" }));
      _reset();
      setShowAddForm(false);
    }

    if (rsp && rsp.DataInt !== null && rsp.DataInt === 0) {
      if (rsp.Errors && rsp.Errors[0]) {
        dispatch(addToast({ title: "Ocurrió un Error", message: rsp.Errors[0], type: "error" }));
      }
    }

    if (addError) {
      console.error(addError);
      dispatch(addToast({ title: "Error", message: "Ocurrió un error al agregar", type: "error" }));
    }
  }, [rsp, addError, updateRsp]);

  const _toggleCellComponent = useCallback(
    (rowData: ColumnCellTemplateData) => {
      return (
        <ToggleSwitch
          label={rowData.data.Activo ? "Activo" : "Inactivo"}
          checked={rowData.data.Activo}
          onChange={(e) => {
            _handleToggleActivo(rowData.data.Id);
          }}
        />
      );
    },
    [catalogoData]
  );

  const _editCellComponent = useCallback(
    (rowData: ColumnCellTemplateData) => {
      return (
        <Tooltip content="Editar">
          <Button color="dark" size="sm" onClick={(e) => _handleEdit(rowData.data.Id)}>
            <FontAwesomeIcon icon={faPencil} />
          </Button>
        </Tooltip>
      );
    },
    [catalogoData]
  );

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <AdminBreadcrumbs
            links={[
              { name: "Catálogos", href: "#" },
              { name: "Líneas de Crédito", href: `${apiHost}/#/catalogos/lineas-de-credito` },
            ]}
          />
        </div>

        <div className="mb-6">
          <AdminPageHeader title="Líneas de Crédito" icon={faRectangleList} />
        </div>

        <div className="mb-6">
          <Button size="xs" onClick={_handleShowModal}>
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            Agregar
          </Button>
        </div>

        <div className="mb-6">
          <DataGrid showBorders={true} showColumnLines={true} showRowLines={true} keyExpr="Id" dataSource={catalogoData}>
            <Paging defaultPageSize={10} />
            <HeaderFilter visible={true} />
            <SearchPanel visible={true} />
            <Selection mode="multiple" showCheckBoxesMode="always" />
            <Export enabled={true} texts={txtsExport} allowExportSelectedData={true} />
            <Column dataField="Empresa" />
            <Column dataField="Banco" />
            <Column dataField="Cuenta" />
            <Column dataField="Monto" format="currency" dataType="number" />
            <Column caption="" cellRender={_toggleCellComponent} width={200} alignment="center" allowExporting={false} />
            <Column caption="" cellRender={_editCellComponent} width={60} alignment="center" allowExporting={false} />
          </DataGrid>
        </div>

        <Modal show={showAddForm} size="md" onClose={_handleHideModal} dismissible={true}>
          <Modal.Header>Agregar Registro</Modal.Header>
          <Modal.Body>
            <div className="mb-2">
              <Label value="Empresa" />
              <Select value={empresaId} onChange={(e) => setEmpresaId(Number(e.target.value))}>
                <option value={0}>Seleccione opción</option>
                {empresasCat &&
                  empresasCat
                    .filter((emp) => emp.Activo)
                    .map((item, index) => (
                      <option value={item.Id} key={index.toString()}>
                        {item.Nombre}
                      </option>
                    ))}
              </Select>
            </div>

            <div className="mb-2">
              <Label value="Banco" />
              <Select value={bancoId} onChange={(e) => setBancoId(Number(e.target.value))}>
                <option value={0}>Seleccione opción</option>
                {bancosCat &&
                  bancosCat
                    .filter((b) => b.Activo)
                    .map((item, index) => (
                      <option value={item.Id} key={index.toString()}>
                        {item.Nombre}
                      </option>
                    ))}
              </Select>
            </div>

            <div className="mb-2">
              <Label value="Cuenta" />
              <TextInput value={cuenta} onChange={(e) => setCuenta(e.target.value)} />
            </div>

            <div className="mb-2">
              <Label value="Monto" />
              <TextInput value={monto} type="number" onChange={(e) => setMonto(Number(e.target.value))} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={_handleSubmit}>Guardar</Button>
            <Button color="failure" onClick={_handleHideModal}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};
