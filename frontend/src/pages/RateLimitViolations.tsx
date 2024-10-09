import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tfoot,
} from "@chakra-ui/react";

interface RateLimitLog {
  type: string;
  clientIP: string;
  phoneNumber: number;
  retryAfter: number;
  timestamp: string;
}

export const RateLimitViolations: React.FC = () => {
  const [violationLogs, setViolationLogs] = useState<RateLimitLog[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:8080/api/logs/stream-logs?logType=rate_limit_error"
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setViolationLogs((prevLogs) => [...prevLogs, data]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Heading size="md" mb={4}>
        Rate Limit Violations
      </Heading>

      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Time</Th>
              <Th>IP</Th>
              <Th isNumeric>Phone Number</Th>
              <Th>Retry After (s)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {violationLogs.map((log, index) => (
              <Tr key={log.timestamp}>
                <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                <Td>{log.clientIP}</Td>
                <Td isNumeric>{log.phoneNumber}</Td>
                <Td>{log.retryAfter}</Td>
              </Tr>
            ))}
          </Tbody>
          {/* <Tfoot>
              <Tr>
                <Th>To convert</Th>
                <Th>into</Th>
                <Th isNumeric>multiply by</Th>
              </Tr>
            </Tfoot> */}
        </Table>
      </TableContainer>
    </Box>
  );
};
