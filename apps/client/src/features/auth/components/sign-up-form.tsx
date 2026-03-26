import * as React from "react";
import { z } from "zod/v4";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  Anchor,
  Box,
  Button,
  Container,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import useAuth from "@/features/auth/hooks/use-auth";
import APP_ROUTE from "@/lib/app-route.ts";
import classes from "@/features/auth/components/auth.module.css";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "./auth-layout.tsx";
import SsoCloudSignup from "@/oss/components/sso-cloud-signup.tsx";

const formSchema = z.object({
  workspaceName: z.string().trim().min(1, { message: "Workspace name is required" }).max(50),
  name: z.string().min(1, { message: "Name is required" }).max(50),
  email: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export function SignUpForm() {
  const { t } = useTranslation();
  const { signUp, isLoading } = useAuth();

  const form = useForm<FormValues>({
    validate: zod4Resolver(formSchema),
    initialValues: {
      workspaceName: "",
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    await signUp(data);
  }

  return (
    <AuthLayout>
      <Container size={420} className={classes.container}>
        <Box p="xl" className={classes.containerBox}>
          <Title order={2} ta="center" fw={500} mb="md">
            {t("Create your workspace")}
          </Title>

          <SsoCloudSignup />

          <form onSubmit={form.onSubmit(onSubmit)}>
            <TextInput
              id="workspaceName"
              type="text"
              label={t("Workspace Name")}
              placeholder={t("e.g ACME Inc")}
              variant="filled"
              mt="md"
              {...form.getInputProps("workspaceName")}
            />

            <TextInput
              id="name"
              type="text"
              label={t("Your Name")}
              placeholder={t("enter your full name")}
              variant="filled"
              mt="md"
              {...form.getInputProps("name")}
            />

            <TextInput
              id="email"
              type="email"
              label={t("Your Email")}
              placeholder="email@example.com"
              variant="filled"
              mt="md"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label={t("Password")}
              placeholder={t("Enter a strong password")}
              variant="filled"
              mt="md"
              {...form.getInputProps("password")}
            />

            <Button type="submit" fullWidth mt="xl" loading={isLoading}>
              {t("Sign Up")}
            </Button>
          </form>
        </Box>
      </Container>
      <Text ta="center">
        {t("Already have an account?")}{" "}
        <Anchor component={Link} to={APP_ROUTE.AUTH.LOGIN} fw={500}>
          {t("Sign in")}
        </Anchor>
      </Text>
    </AuthLayout>
  );
}
