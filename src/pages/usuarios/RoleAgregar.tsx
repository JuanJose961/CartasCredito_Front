import { useAddRoleMutation, useGetPermissionsQuery } from "@/apis";
import { AdminBreadcrumbs, AdminPageHeader } from "@/components";
import { useAppDispatch } from "@/store";
import { addToast } from "@/store/uiSlice";
import { apiHost } from "@/utils/apiConfig";
import { faCircleArrowLeft, faShieldHalved, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button as FButton, Checkbox, Label, Textarea, TextInput } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

/** Form Validation Schema */
const validationSchema = z.object({
  Name: z.string().min(1),
});

type ValidationSchema = z.infer<typeof validationSchema>;

export const RoleAgregar = () => {
  const nav = useNavigate();

  /** Component State */
  const [permissions, setPermissions] = useState<Array<number>>([]);

  /** Action Dispatcher */
  const dispatch = useAppDispatch();

  /** API Calls */
  const { data: catPermissions } = useGetPermissionsQuery();
  const [addModel, { isLoading: isAdding, isSuccess: isAdded, isError: isAddingError, data: isAddedData }] = useAddRoleMutation();

  /** Form Setup */
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  /** EVENT HANDLERS */
  const _handleBack = () => {
    nav("/roles");
  };

  const _handleSubmit = handleSubmit((formData) => {
    addModel({ ...formData, Permissions: permissions });
  });

  const _handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newPermissions = [...permissions];
      let empresaId = Number(e.target.value);

      if (e.target.checked) {
        newPermissions.push(empresaId);
      } else {
        let rmIndex = newPermissions.findIndex((empId) => empId === empresaId);
        newPermissions.splice(rmIndex, 1);
      }

      setPermissions(newPermissions);
    },
    [permissions]
  );

  /** EFFECT HOOKS */
  useEffect(() => {
    if (isAddingError) {
      dispatch(
        addToast({
          title: "Información",
          message: "Ocurrió un error interno. Verifique los datos e intente nuévamente.",
          type: "error",
        })
      );
    }

    if (isAdded) {
      if (isAdded && isAddedData) {
        if (isAddedData.DataInt === 1) {
          dispatch(
            addToast({
              title: "Información",
              message: "Se creó el rol correctamente",
              type: "success",
            })
          );

          nav(`/roles`);
        } else {
          dispatch(
            addToast({
              title: "Información",
              message: isAddedData.Errors && isAddedData.Errors.length > 0 ? isAddedData.Errors[0] : "Ocurrió un error",
              type: "error",
            })
          );
        }
      }
    }
  }, [isAdding, isAdded, isAddingError, isAddedData]);

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <AdminBreadcrumbs
            links={[
              { name: "Roles", href: "#" },
              { name: "Agregar", href: `${apiHost}/#/roles/agregar` },
            ]}
          />
        </div>

        <div className="mb-6">
          <AdminPageHeader title="Roles" subtitle="Agregar" icon={faShieldHalved} />
        </div>

        <div className="mb-6">
          <FButton outline color="dark" size="xs" onClick={_handleBack}>
            <FontAwesomeIcon icon={faCircleArrowLeft} className="mr-2" />
            Regresar
          </FButton>
        </div>

        <div className="mb-6">
          <form onSubmit={_handleSubmit}>
            <div className="md:grid md:grid-cols-12 md:gap-4 mb-6">
              <div className="md:col-span-6">
                <Label value="Nombre de Rol" />
                <TextInput
                  {...register("Name")}
                  placeholder="ej: Comprador"
                  color={formErrors.Name ? "failure" : "gray"}
                  helperText={formErrors.Name?.message}
                />
              </div>
            </div>

            <h3 className="mb-4">Permisos</h3>
            <div className="md:grid md:grid-cols-12 md:gap-4">
              {catPermissions &&
                catPermissions.length > 0 &&
                catPermissions.map((item, index) => {
                  return (
                    <div className="md:col-span-4 flex items-center justify-start gap-2" key={index.toString()}>
                      <Checkbox id={`permission-${item.Id}`} onChange={_handleCheckboxChange} value={item.Id} />
                      <Label htmlFor={`permission-${item.Id}`}>{item.Name}</Label>
                    </div>
                  );
                })}
            </div>

            <div className="mt-4">
              <FButton type="submit">Guardar</FButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
