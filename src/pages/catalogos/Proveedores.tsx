import { useAddContactoMutation, useUpdateContactoMutation } from "@/apis/contactosApi";
import { useGetEmpresasQuery } from "@/apis/empresasApi";
import { useAddProveedorMutation, useGetProveedoresQuery, useToggleProveedorMutation, useUpdateProveedorMutation } from "@/apis/proveedoresApi";
import { useGetTiposPersonaFiscalQuery } from "@/apis/tiposPersonaFiscal";
import { AdminBreadcrumbs, AdminPageHeader } from "@/components";
import { IProveedorInsert, IProveedorUpdate } from "@/interfaces";
import { useAppDispatch } from "@/store";
import { addToast } from "@/store/uiSlice";
import { apiHost } from "@/utils/apiConfig";
import { faIdCard, faPencil, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Label, Modal, Select, Table, Textarea, TextInput, ToggleSwitch, Tooltip } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import DataGrid, { Column, Export, HeaderFilter, Paging, SearchPanel, Selection } from "devextreme-react/data-grid";
import { ColumnCellTemplateData } from "devextreme/ui/data_grid";

const txtsExport = {
  exportAll: "Exportar Todo",
  exportSelectedRows: "Exportar Selección",
  exportTo: "Exportar A",
};

export const Proveedores = () => {
  const nav = useNavigate();

  const {
    reset,
    register,
    setValue,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<IProveedorInsert | IProveedorUpdate>();

  const { data: catalogoData, isLoading, error } = useGetProveedoresQuery();
  const [addModelo, { isLoading: isAdding, error: addError, data: rsp }] = useAddProveedorMutation();
  const [updateModelo, { data: updateRsp, isSuccess: updateSuccess }] = useUpdateProveedorMutation();
  const [toggleModelo, { data: toggleRsp, isSuccess: toggleSuccess }] = useToggleProveedorMutation();
  const [addContacto, { error: addContactoError, data: rspContacto }] = useAddContactoMutation();
  const [updateContacto] = useUpdateContactoMutation();

  const { data: catEmpresas } = useGetEmpresasQuery();

  const dispatch = useAppDispatch();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(0);

  const _handleShowModal = useCallback(() => {
    setEditId(0);
    setValue("Nombre", "");
    setValue("EmpresaId", 0);
    setValue("Descripcion", "");
    setValue("Pais", "");
    setValue("Contacto.Nombre", "");
    setValue("Contacto.ApellidoPaterno", "");
    setValue("Contacto.ApellidoMaterno", "");
    setValue("Contacto.Telefono", "");
    setValue("Contacto.Email", "");
    setValue("Contacto.Fax", "");
    setShowAddForm(true);
  }, [showAddForm]);

  const _handleHideModal = useCallback(() => {
    setEditId(0);
    setShowAddForm(false);
    reset();
  }, [showAddForm]);

  const _handleToggleActivo = useCallback((modelId: number) => {
    toggleModelo(modelId);
  }, []);

  const _handleEdit = (modelId: number) => {
    let editModel = catalogoData?.find((i) => i.Id === modelId);

    if (editModel) {
      setEditId(editModel.Id);
      setValue("Nombre", editModel.Nombre);
      setValue("EmpresaId", editModel.EmpresaId);
      setValue("Descripcion", editModel.Descripcion);
      setValue("Contacto", editModel.Contacto);
      setValue("Pais", editModel.Pais ? editModel.Pais : "");
      setShowAddForm(true);
    } else {
      dispatch(addToast({ title: "Ocurrió un Error", message: "No se encuentra el elemento", type: "error" }));
    }
  };

  const _handleSubmit = handleSubmit((formData) => {
    if (editId > 0) {
      // Elemento editado
      updateModelo({ ...formData, Id: editId });
    } else {
      // Registrar nuevo elemento
      addModelo(formData);
    }
  });

  useEffect(() => {
    if (rsp && rsp.DataInt !== null && rsp.DataInt > 0) {
      dispatch(addToast({ title: "Éxito", message: "Registro agregado con éxito", type: "success" }));
      _handleHideModal();
    }

    if (updateRsp && updateRsp.DataInt !== null && updateRsp.DataInt > 0) {
      dispatch(addToast({ title: "Éxito", message: "Registro actualizado con éxito", type: "success" }));
      _handleHideModal();
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
              { name: "Proveedores", href: `${apiHost}/#/catalogos/proveedores` },
            ]}
          />
        </div>

        <div className="mb-6">
          <AdminPageHeader title="Proveedores" icon={faIdCard} />
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
            <Column dataField="Nombre" />
            <Column dataField="Empresa" />
            <Column dataField="Pais" caption="País" />
            <Column dataField="Descripcion" caption="Domicilio" />
            <Column caption="" cellRender={_toggleCellComponent} width={200} alignment="center" allowExporting={false} />
            <Column caption="" cellRender={_editCellComponent} width={60} alignment="center" allowExporting={false} />
          </DataGrid>
        </div>

        <Modal show={showAddForm} size="3xl" onClose={_handleHideModal} dismissible={true}>
          <Modal.Header>Agregar Registro</Modal.Header>
          <form onSubmit={_handleSubmit}>
          <Modal.Body>
            <div className="md:grid md:grid-cols-12 md:gap-4">
              <div className="md:col-span-6">
                <div className="mb-2">
                  <Label htmlFor="empresaId" value="Empresa" />
                  <Select {...register("EmpresaId", { required: true })} defaultValue={0}>
                    <option value={0}>Seleccione Opción</option>
                    {catEmpresas
                      ?.filter((d) => d.Activo)
                      .map((item, index) => {
                        return (
                          <option key={index.toString()} value={item.Id}>
                            {item.Nombre}
                          </option>
                        );
                      })}
                  </Select>
                </div>
                <div className="mb-2">
                  <Label htmlFor="nombre" value="Nombre" />
                  <TextInput id="nombre" defaultValue="" type="text" required={true} {...register("Nombre")} />
                </div>
              </div>
              <div className="md:col-span-6">
                <div className="mb-2">
                  <Label htmlFor="pais" value="País" />
                  <TextInput defaultValue="" type="text" required={true} {...register("Pais")} />
                </div>
                <Label htmlFor="descripcion" value="Domicilio" />
                <Textarea defaultValue="" rows={1}  required={true} {...register("Descripcion")} />
              </div>
            </div>

            <Label value="CONTACTO" className="opacity-60" />

            <div className="md:grid md:grid-cols-12 md:gap-4">
              <div className="md:col-span-4">
                <Label htmlFor="nombre" value="Nombre" />
                <TextInput defaultValue="" type="text" {...register("Contacto.Nombre")} />
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="ApellidoPaterno" value="Apellido Paterno" />
                <TextInput defaultValue="" type="text" {...register("Contacto.ApellidoPaterno")} />
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="ApellidoMaterno" value="Apellido Materno" />
                <TextInput defaultValue="" type="text" {...register("Contacto.ApellidoMaterno")} />
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="Telefono" value="Teléfono" />
                <TextInput defaultValue="" type="text" {...register("Contacto.Telefono")} />
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="Email" value="Email" />
                <TextInput defaultValue="" type="text" {...register("Contacto.Email")} />
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="Fax" value="Fax" />
                <TextInput defaultValue="" type="text" {...register("Contacto.Fax")} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={_handleSubmit}>Guardar</Button>
            <Button color="failure" onClick={_handleHideModal}>
              Cancelar
            </Button>
          </Modal.Footer>
          </form>
        </Modal>
      </div>
    </>
  );
};
