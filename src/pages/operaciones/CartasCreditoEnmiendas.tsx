import { useLazyGetCartaComercialQuery } from "@/apis";
import { AdminLoadingActivity, AdminBreadcrumbs, AdminPageHeader } from "@/components";
import { useAppDispatch } from "@/store";
import { apiHost } from "@/utils/apiConfig";
import { faFileInvoiceDollar, faCircleArrowLeft, faSave, faClose, faCheckCircle, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Card, FileInput, Label, TextInput, Textarea } from "flowbite-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import numeral from "numeral";
import { useAddEnmiendaMutation, useAddSwiftEnmiendaMutation, useApproveEnmiendaMutation } from "@/apis/enmiendasApi";
import { Controller, useForm } from "react-hook-form";
import { addToast } from "@/store/uiSlice";
import DatePicker from "react-datepicker";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

const validationSchema = z
  .object({
    FechaLimiteEmbarque: z.date().nullable().optional(),
    FechaVencimiento: z.date().nullable().optional(),
    ImporteLC: z.number().nullable().optional(),
    DescripcionMercancia: z.string().nullable().optional(),
    ConsideracionesAdicionales: z.string().nullable().optional(),
    InstruccionesEspeciales: z.string().nullable().optional(),
    DiasParaPresentarDocumentos: z.number().default(0),
  })
  .refine(
    (args) => {
      if (args.FechaVencimiento && args.FechaLimiteEmbarque) {
        let tiempoLimite = args.FechaVencimiento.getTime();
        let tiempoCalculado = args.FechaLimiteEmbarque.getTime() + 86400000 * args.DiasParaPresentarDocumentos;

        if (tiempoLimite > tiempoCalculado) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    },
    {
      message: "La fecha límite de embarque no puede ser mayor a la fecha de vencimiento",
      path: ["FechaLimiteEmbarque"],
    }
  );

type ValidationSchema = z.infer<typeof validationSchema>;

const DatePickerCustomInput = ({ value, onClick }: { value: string; onClick: React.MouseEventHandler<HTMLInputElement> }, ref: React.Ref<HTMLInputElement>) => (
  <TextInput onClick={onClick} value={value} readOnly />
);

export const CartasCreditoEnmiendas = () => {
  const routeParams = useParams();
  const nav = useNavigate();

  const dispatch = useAppDispatch();

  const {
    reset,
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors: formErrors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  const [getCartaComercial, { data: cartaCreditoDetalle, isLoading, isSuccess: isGetDetalleSuccess }] = useLazyGetCartaComercialQuery();
  const [addEnmienda, { data, isSuccess, isError }] = useAddEnmiendaMutation();
  const [addSwiftEnmienda, { data: addSwiftData, isSuccess: addSwiftSuccess, isError: addSwiftError }] = useAddSwiftEnmiendaMutation();
  const [approveEnmienda, { data: approveData, isSuccess: approveIsSuccess, isError: approveIsError }] = useApproveEnmiendaMutation();

  const [files, setFiles] = useState<FileList | null>(null);

  const _handleBack = useCallback(() => {
    nav(`/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}`);
  }, [cartaCreditoDetalle]);

  const _handleHistorial = useCallback(() => {
    nav(`/operaciones/cartas-de-credito/${cartaCreditoDetalle?.Id}/enmiendas/historial`);
  }, [cartaCreditoDetalle]);

  const _handleSubmit = handleSubmit((formData) => {
    if (cartaCreditoDetalle && cartaCreditoDetalle.Id) {
      if (cartaCreditoDetalle.Estatus === 21 && cartaCreditoDetalle.Enmiendas) {
        if (files === null) {
          toast.error("Seleccione archivo Swift");
          return;
        }
        approveEnmienda(cartaCreditoDetalle.Enmiendas[0].Id).then(() => {
          addSwiftEnmienda({
            EnmiendaId: cartaCreditoDetalle.Enmiendas && cartaCreditoDetalle.Enmiendas[0].Id ? cartaCreditoDetalle.Enmiendas[0].Id : 0,
            SwiftFile: files,
          });
        });
      } else {
        addEnmienda({ ...formData, CartaCreditoId: cartaCreditoDetalle.Id });
      }
    }
  });

  useEffect(() => {
    if (routeParams.cartaCreditoId) {
      getCartaComercial(routeParams.cartaCreditoId);
    }
  }, [routeParams]);

  useEffect(() => {
    if (isGetDetalleSuccess && cartaCreditoDetalle && cartaCreditoDetalle.DiasParaPresentarDocumentos) {
      setValue("DiasParaPresentarDocumentos", cartaCreditoDetalle.DiasParaPresentarDocumentos);
    }

    if (isGetDetalleSuccess && cartaCreditoDetalle && cartaCreditoDetalle.Enmiendas && cartaCreditoDetalle.Enmiendas[0] && cartaCreditoDetalle.Enmiendas[0].Estatus === 1) {
      setValue("ImporteLC", cartaCreditoDetalle.Enmiendas[0].ImporteLC);

      if (cartaCreditoDetalle.Enmiendas[0].FechaVencimiento) {
        let fv = new Date(cartaCreditoDetalle.Enmiendas[0].FechaVencimiento);
        setValue("FechaVencimiento", fv);
      }

      if (cartaCreditoDetalle.Enmiendas[0].FechaLimiteEmbarque) {
        let fle = new Date(cartaCreditoDetalle.Enmiendas[0].FechaLimiteEmbarque);
        setValue("FechaLimiteEmbarque", fle);
      }

      setValue("DescripcionMercancia", cartaCreditoDetalle.Enmiendas[0].DescripcionMercancia);
      setValue("ConsideracionesAdicionales", cartaCreditoDetalle.Enmiendas[0].ConsideracionesAdicionales);
      setValue("InstruccionesEspeciales", cartaCreditoDetalle.Enmiendas[0].InstruccionesEspeciales);
    }
  }, [isGetDetalleSuccess, cartaCreditoDetalle]);

  useEffect(() => {
    if (approveIsSuccess && approveData) {
      if (approveData.DataInt && approveData.DataInt > 0) {
        dispatch(
          addToast({
            title: "Información",
            type: "success",
            message: "Solicitud de enmienda aprobada correctamente",
          })
        );

        _handleBack();
      } else {
        dispatch(
          addToast({
            title: "Información",
            type: "error",
            message: approveData.Errors && approveData.Errors[0] ? approveData.Errors[0] : "Ocurrió un error desconocido",
          })
        );
      }
    }

    if (approveIsError && approveData && approveData.Errors) {
      dispatch(
        addToast({
          title: "Información",
          type: "error",
          message: approveData.Errors[0],
        })
      );
    }
  }, [approveIsSuccess, approveData, approveIsError]);

  useEffect(() => {
    if (isSuccess && data) {
      if (data.DataInt && data.DataInt > 0) {
        dispatch(
          addToast({
            title: "Información",
            type: "success",
            message: "Solicitud de enmienda enviada correctamente",
          })
        );

        _handleBack();
      } else {
        dispatch(
          addToast({
            title: "Información",
            type: "error",
            message: data.Errors && data.Errors[0] ? data.Errors[0] : "Ocurrió un error desconocido",
          })
        );
      }
    }

    if (isError && data && data.Errors) {
      dispatch(
        addToast({
          title: "Información",
          type: "error",
          message: data.Errors[0],
        })
      );
    }
  }, [isSuccess, data, isError]);

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
          <AdminPageHeader title="Cartas de Crédito" subtitle="Emiendas" icon={faFileInvoiceDollar} />
        </div>

        <div className="mb-4 flex items-center justify-start gap-4">
          <Button outline color="dark" size="xs" onClick={_handleBack}>
            <FontAwesomeIcon icon={faCircleArrowLeft} className="mr-2" />
            Regresar
          </Button>

          <Button outline color="dark" size="xs" onClick={_handleHistorial}>
            <FontAwesomeIcon icon={faClockRotateLeft} className="mr-2" />
            Historial de Enmiendas
          </Button>
        </div>

        <form className="mb-12" onSubmit={_handleSubmit}>
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
                  Nombre del Contacto de Solicitante:
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
            {formErrors.FechaLimiteEmbarque && (
              <div className="px-6 mb-4">
                <Alert color="failure">
                  <ul className="list-disc ml-6">
                    <li>La FECHA LÍMITE DE EMBARQUE no puede ser mayor a la FECHA DE VENCIMIENTO</li>
                    <li>La FECHA DE VENCIMIENTO debe ser por lo menos igual a la FECHA LÍMITE DE EMBARQUE + DÍAS DE PLAZO PARA PRESENTAR DOCUMENTOS</li>
                  </ul>
                </Alert>
              </div>
            )}
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5 flex items-center justify-between gap-4">
                <Label value="Importe de L/C" />
                <TextInput value={numeral(cartaCreditoDetalle.MontoOriginalLC).format("$ 0,0.00")} disabled />
              </div>
              <div className="md:col-span-5 md:col-start-7 flex items-center justify-between gap-4">
                <Label value="Nuevo Importe de L/C" />
                <TextInput type="number" {...register("ImporteLC", { setValueAs: (v) => (v === "" ? null : Number(v)) })} readOnly={cartaCreditoDetalle.Estatus === 21} />
              </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5 flex items-center justify-between gap-4">
                <Label value="Fecha de Vencimiento" />
                <TextInput value={cartaCreditoDetalle.FechaVencimiento?.toString()} disabled />
              </div>
              <div className="md:col-span-5 md:col-start-7 flex items-center justify-between gap-4">
                <Label value="Nueva Fecha de Vencimiento" />
                {/* <TextInput type="date" {...register("FechaVencimiento")} readOnly={cartaCreditoDetalle.Estatus === 21} /> */}
                <div className="w-1/2">
                  <Controller
                    control={control}
                    name="FechaVencimiento"
                    render={({ field }) => (
                      <DatePicker
                        customInput={React.createElement(React.forwardRef(DatePickerCustomInput))}
                        placeholderText="Seleccione Fecha"
                        onChange={(date) => field.onChange(date)}
                        selected={field.value}
                        dateFormat="dd/MM/yyyy"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5 flex items-center justify-between gap-4">
                <Label value="Fecha Límite de Embarque" />
                <TextInput value={cartaCreditoDetalle.FechaLimiteEmbarque?.toString()} disabled />
              </div>
              <div className="md:col-span-5 md:col-start-7 flex items-center justify-between gap-4">
                <Label value="Nueva Fecha Límite de Embarque" />
                {/* <TextInput type="date" {...register("FechaLimiteEmbarque")} readOnly={cartaCreditoDetalle.Estatus === 21} /> */}
                <div className="w-1/2">
                  <Controller
                    control={control}
                    name="FechaLimiteEmbarque"
                    render={({ field }) => (
                      <DatePicker
                        customInput={React.createElement(React.forwardRef(DatePickerCustomInput))}
                        placeholderText="Seleccione Fecha"
                        onChange={(date) => field.onChange(date)}
                        selected={field.value}
                        dateFormat="dd/MM/yyyy"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="mb-4">
            <h3 className="font-bold">Descripción de Mercancías</h3>
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-6">
                <Label value="Actual" />
                <Textarea value={cartaCreditoDetalle.DescripcionMercancia ? cartaCreditoDetalle.DescripcionMercancia : ""} disabled />
              </div>
              <div className="md:col-span-6">
                <Label value="Debe Decir" />
                <Textarea {...register("DescripcionMercancia")} readOnly={cartaCreditoDetalle.Estatus === 21} />
              </div>
            </div>
          </Card>

          <Card className="mb-4">
            <h3 className="font-bold">Consideraciones Adicionales</h3>
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-6">
                <Label value="Actual" />
                <Textarea value={cartaCreditoDetalle.ConsideracionesAdicionales ? cartaCreditoDetalle.ConsideracionesAdicionales : ""} disabled />
              </div>
              <div className="md:col-span-6">
                <Label value="Debe Decir" />
                <Textarea {...register("ConsideracionesAdicionales")} readOnly={cartaCreditoDetalle.Estatus === 21} />
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="font-bold">Instrucciones Especiales</h3>
            <div className="md:grid md:grid-cols-12 md:gap-12">
              <div className="md:col-span-6">
                <Label value="Actual" />
                <Textarea value={cartaCreditoDetalle.InstruccionesEspeciales ? cartaCreditoDetalle.InstruccionesEspeciales : ""} disabled />
              </div>
              <div className="md:col-span-6">
                <Label value="Debe Decir" />
                <Textarea {...register("InstruccionesEspeciales")} readOnly={cartaCreditoDetalle.Estatus === 21} />
              </div>
            </div>
          </Card>

          {cartaCreditoDetalle.Estatus === 21 && (
            <Card className="mb-6">
              <h3 className="font-bold">Adjuntar Documento Swift</h3>
              <FileInput
                onChange={(e) => {
                  setFiles(e.target.files);
                }}
              />
            </Card>
          )}

          <div className="flex items-center gap-4">
            <Button color="failure" onClick={_handleBack}>
              <FontAwesomeIcon icon={faClose} className="mr-2" />
              Cancelar
            </Button>
            {cartaCreditoDetalle.Estatus !== 21 && (
              <Button type="submit">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Guardar
              </Button>
            )}

            {cartaCreditoDetalle.Estatus === 21 && (
              <Button type="submit" color="success">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                Aprobar Solicitud de Enmienda
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};
