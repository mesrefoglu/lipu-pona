import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Spinner, Alert, AlertIcon, Flex } from "@chakra-ui/react";
import { confirmEmailApi } from "../api/endpoints.js";
import { useLang } from "../contexts/useLang.js";
import { COLOR_1 } from "../constants/constants.js";

const ActivateAccount = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const { t } = useLang();
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        confirmEmailApi(uid, token)
            .then(({ success }) => {
                setStatus(success ? "ok" : "error");
            })
            .catch(() => setStatus("error"));
    }, [uid, token, navigate]);

    if (status === "loading") {
        return (
            <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color={COLOR_1} />
            </Box>
        );
    }

    return (
        <Flex alignItems="center" justifyContent="center">
            <Alert w="container.sm" m={10} status={status === "ok" ? "success" : "error"} rounded="md">
                <AlertIcon />
                {status === "ok" ? t("email_confirm_success") : t("email_confirm_error")}
            </Alert>
        </Flex>
    );
};

export default ActivateAccount;
