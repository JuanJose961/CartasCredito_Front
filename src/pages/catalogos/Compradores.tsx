import { useAddCompradorMutation, useGetCompradoresQuery, useToggleCompradorMutation, useUpdateCompradorMutation } from "@/apis/compradoresApi";
import { useGetEmpresasQuery } from "@/apis/empresasApi";
import { useGetTiposPersonaFiscalQuery } from "@/apis/tiposPersonaFiscal";
import { AdminBreadcrumbs, AdminPageHeader } from "@/components";
import { useAppDispatch } from "@/store";
import { addToast } from "@/store/uiSlice";
import { faIdCard, faPencil, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Label, Modal, Select, Table, Textarea, TextInput, ToggleSwitch, Tooltip } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";

export const Compradores = () => {
  const { data: catalogoData, isLoading, error } = useGetCompradoresQuery();
  const [addModelo, { isLoading: isAdding, error: addError, data: rsp }] = useAddCompradorMutation();
  const [updateModelo, { data: updateRsp, isSuccess: updateSuccess }] = useUpdateCompradorMutation();
  const [toggleModelo, { data: toggleRsp, isSuccess: toggleSuccess }] = useToggleCompradorMutation();

  const { data: catEmpresas } = useGetEmpresasQuery();
  const { data: catTiposPersonaFiscal } = useGetTiposPersonaFiscalQuery();

  const dispatch = useAppDispatch();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(0);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [empresaId, setEmpresaId] = useState(0);
  const [tipoPersonaFiscalId, setTipoPersonaFiscalId] = useState(0);

  const _reset = useCallback(() => {
    setEditId(0);
    setNombre("");
    setDescripcion("");
    setEmpresaId(0);
    setTipoPersonaFiscalId(0);
  }, [editId, nombre, descripcion, empresaId, tipoPersonaFiscalId]);

  const _handleShowModal = useCallback(() => {
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
      setNombre(editModel.Nombre);
      setEmpresaId(editModel.EmpresaId);
      setTipoPersonaFiscalId(editModel.TipoPersonaFiscalId);
      setDescripcion(editModel.Descripcion);
      setShowAddForm(true);
    } else {
      dispatch(addToast({ title: "Ocurrió un Error", message: "No se encuentra el elemento", type: "error" }));
    }
  };

  const _handleSubmit = useCallback(() => {
    if (nombre.length < 1) {
      dispatch(addToast({ title: "Ocurrió un Error", message: "Ingrese el nombre del elemento", type: "error" }));
      return;
    }

    if (editId > 0) {
      updateModelo({ Id: editId, Nombre: nombre, Descripcion: descripcion, EmpresaId: empresaId, TipoPersonaFiscalId: tipoPersonaFiscalId });
    } else {
      addModelo({ Nombre: nombre, Descripcion: descripcion, EmpresaId: empresaId, TipoPersonaFiscalId: tipoPersonaFiscalId });
    }
  }, [editId, nombre, descripcion, empresaId, tipoPersonaFiscalId]);

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
      dispatch(addToast({ title: "Error", message: "Ocurrió un error al agregar", type: "success" }));
    }
  }, [rsp, addError, updateRsp]);

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <AdminBreadcrumbs
            links={[
              { name: "Catálogos", href: "#" },
              { name: "Compradores", href: "/catalogos/compradores" },
            ]}
          />
        </div>

        <div className="mb-6">
          <AdminPageHeader title="Compradores" icon={faIdCard} />
        </div>

        <div className="mb-6">
          <Button size="xs" onClick={_handleShowModal}>
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            Agregar
          </Button>
        </div>

        <div className="mb-6">
          <Table>
            <Table.Head>
              <Table.HeadCell>Comprador</Table.HeadCell>
              <Table.HeadCell>Descripción</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {catalogoData &&
                catalogoData.map((item, index) => {
                  return (
                    <Table.Row key={index.toString()}>
                      <Table.Cell className="">{item.Nombre}</Table.Cell>
                      <Table.Cell>{item.Descripcion}</Table.Cell>
                      <Table.Cell align="right" className="flex flex-wrap items-center gap-2">
                        <Tooltip content="Editar">
                          <Button color="dark" size="sm" onClick={(e) => _handleEdit(item.Id)}>
                            <FontAwesomeIcon icon={faPencil} />
                          </Button>
                        </Tooltip>
                      </Table.Cell>
                      <Table.Cell>
                        <ToggleSwitch
                          checked={item.Activo}
                          label="Activo"
                          onChange={(e) => {
                            _handleToggleActivo(item.Id);
                          }}
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table>
        </div>

        <Modal show={showAddForm} size="md" onClose={_handleHideModal} dismissible={true}>
          <Modal.Header>Agregar Registro</Modal.Header>
          <Modal.Body>
            <div className="mb-4">
              <Label htmlFor="empresaId" value="Empresa" />
              <Select
                id="empresaId"
                required={true}
                value={empresaId}
                onChange={(e) => {
                  setEmpresaId(Number(e.target.value));
                }}>
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

            <div className="mb-4">
              <Label htmlFor="tipoPersonaFiscalId" value="Tipo Persona Fiscal" />
              <Select
                id="tipoPersonaFiscalId"
                required={true}
                value={tipoPersonaFiscalId}
                onChange={(e) => {
                  console.log(e.target.value);
                  setTipoPersonaFiscalId(Number(e.target.value));
                }}>
                {catTiposPersonaFiscal
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

            <div className="mb-4">
              <Label htmlFor="nombre" value="Nombre" />
              <TextInput
                id="nombre"
                type="text"
                placeholder="Ingrese el nombre para el nuevo elemento"
                required={true}
                onChange={(e) => setNombre(e.target.value)}
                value={nombre}
              />
            </div>

            <div>
              <Label htmlFor="descripcion" value="Descripción" />
              <Textarea id="descripcion" placeholder="" required={false} rows={5} onChange={(e) => setDescripcion(e.target.value)} value={descripcion} />
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