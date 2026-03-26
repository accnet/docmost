import SettingsTitle from "@/components/settings/settings-title";
import { SearchInput } from "@/components/common/search-input";
import NoTableResults from "@/components/common/no-table-results";
import Paginate from "@/components/common/paginate";
import { usePaginateAndSearch } from "@/hooks/use-paginate-and-search";
import {
  useActivateSystemUserMutation,
  useDeactivateSystemUserMutation,
  useDeleteSystemUserMutation,
  useSystemUsersQuery,
} from "@/features/user/queries/system-user-query";
import { Badge, Button, Group, Table, Text } from "@mantine/core";
import { Helmet } from "react-helmet-async";
import { getAppName } from "@/lib/config";
import { useTranslation } from "react-i18next";

export default function SystemUsersPage() {
  const { t } = useTranslation();
  const { search, cursor, goNext, goPrev, handleSearch } = usePaginateAndSearch();
  const { data } = useSystemUsersQuery({ cursor, limit: 100, query: search });
  const deactivateMutation = useDeactivateSystemUserMutation();
  const activateMutation = useActivateSystemUserMutation();
  const deleteMutation = useDeleteSystemUserMutation();

  return (
    <>
      <Helmet>
        <title>
          {t("User Management")} - {getAppName()}
        </title>
      </Helmet>
      <SettingsTitle title={t("User Management")} />
      <SearchInput onSearch={handleSearch} />

      <Table.ScrollContainer minWidth={800}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("User")}</Table.Th>
              <Table.Th>{t("Workspace")}</Table.Th>
              <Table.Th>{t("Status")}</Table.Th>
              <Table.Th>{t("Source")}</Table.Th>
              <Table.Th>{t("Actions")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.items.length ? (
              data.items.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Text fw={500}>{user.name}</Text>
                    <Text c="dimmed" size="sm">
                      {user.email}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text>{user.workspaceName ?? "-"}</Text>
                    {user.isSuperUser && (
                      <Badge mt={4} variant="light" color="red">
                        {t("Super User")}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {user.deletedAt ? (
                      <Badge color="red" variant="light">
                        {t("Deleted")}
                      </Badge>
                    ) : user.deactivatedAt ? (
                      <Badge color="orange" variant="light">
                        {t("Deactivated")}
                      </Badge>
                    ) : (
                      <Badge variant="light">{t("Active")}</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>{user.registrationSource ?? "-"}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {user.deactivatedAt ? (
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() =>
                            activateMutation.mutate({ userId: user.id })
                          }
                        >
                          {t("Activate")}
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="light"
                          color="orange"
                          onClick={() =>
                            deactivateMutation.mutate({ userId: user.id })
                          }
                        >
                          {t("Deactivate")}
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        onClick={() => deleteMutation.mutate({ userId: user.id })}
                      >
                        {t("Delete")}
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <NoTableResults colSpan={5} />
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {data?.items.length ? (
        <Paginate
          hasPrevPage={data.meta?.hasPrevPage}
          hasNextPage={data.meta?.hasNextPage}
          onNext={() => goNext(data.meta?.nextCursor)}
          onPrev={goPrev}
        />
      ) : null}
    </>
  );
}
