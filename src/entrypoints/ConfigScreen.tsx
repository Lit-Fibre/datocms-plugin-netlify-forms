import { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import {
  Button,
  Canvas,
  Form,
  FieldGroup,
  SelectField,
  TextInput,
} from "datocms-react-ui";
import { useEffect, useState } from "react";
import { Form as FormHandler, Field } from "react-final-form";
import Client from "../utils/client";

type PropTypes = {
  ctx: RenderConfigScreenCtx;
};

export type ValidParameters = {
  accessToken: string;
  site: { label: string; value: string };
};

type Parameters = ValidParameters;

export default function ConfigScreen({ ctx }: PropTypes) {
  const parameters = ctx.plugin.attributes.parameters;
  const accessToken = parameters.accessToken as string;
  const [sites, setSites] = useState([]);

  useEffect(() => {
    const fetchSites = async () => {
      setSites([]);

      try {
        const client = new Client({ accessToken });
        const res = await client.sites();
        const sites = await res.json();
        setSites(sites);
      } catch (error: any) {
        ctx.alert(error.message);
      }
    };

    if (accessToken) fetchSites();
  }, [accessToken, ctx]);

  return (
    <Canvas ctx={ctx}>
      <FormHandler<Parameters>
        initialValues={ctx.plugin.attributes.parameters}
        validate={(values) => {
          const errors: Record<string, string> = {};

          if (!("accessToken" in values) || !values.accessToken) {
            errors.accessToken = "This field is required!";
          }

          return errors;
        }}
        onSubmit={async (values) => {
          await ctx.updatePluginParameters({
            ...values,
            ...(values.accessToken !== accessToken ? { site: null } : {}),
          });

          ctx.notice("Settings updated successfully!");
        }}
      >
        {({ handleSubmit, submitting, dirty }) => (
          <Form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field name="accessToken">
                {({ input, meta: { error } }) => (
                  <TextInput
                    id="accessToken"
                    labelText="Access token"
                    required
                    error={error}
                    {...input}
                    type="password"
                  />
                )}
              </Field>

              {sites.length > 0 || parameters.site ? (
                <Field name="site">
                  {({ input, meta: { error } }) => (
                    <SelectField
                      id="site"
                      label="Site"
                      error={error}
                      selectInputProps={{
                        options: sites.map((site: any) => ({
                          label: site.name,
                          value: site.site_id,
                        })),
                      }}
                      {...input}
                    />
                  )}
                </Field>
              ) : null}
            </FieldGroup>
            <Button
              type="submit"
              fullWidth
              buttonSize="l"
              buttonType="primary"
              disabled={submitting || !dirty}
            >
              {!accessToken ? "Connect" : "Save settings"}
            </Button>
          </Form>
        )}
      </FormHandler>
    </Canvas>
  );
}
