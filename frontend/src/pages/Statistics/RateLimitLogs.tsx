import React, { useEffect, useState, useRef } from "react";
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
} from "@chakra-ui/react";

interface RateLimitLog {
  type: string;
  clientIP: string;
  phoneNumber: number;
  retryAfter: number;
  timestamp: string;
}

export const RateLimitLogs: React.FC = () => {
  const [rateLimitLogs, setRateLimitLogs] = useState<RateLimitLog[]>([]);
  const lastLogRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.REACT_APP_HOST}/api/logs/stream-logs?logType=rate_limit_error`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRateLimitLogs((prevLogs) => {
        // If the number of logs is 10, remove the oldest (first) one and add the new log
        if (prevLogs.length >= 100) {
          return [...prevLogs.slice(1), data];
        } else {
          return [...prevLogs, data];
        }
      });
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    // Scroll to the last log whenever the log list is updated
    if (lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [rateLimitLogs]);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Heading size="md" mb={4}>
        Rate Limit Violations
      </Heading>

      <TableContainer
        maxHeight={"40vh"}
        overflowY={"auto"}
        width={["340px", "400px", "800px"]}
      >
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
            {rateLimitLogs.map((log, index) => (
              <Tr
                key={log.timestamp}
                ref={index === rateLimitLogs.length - 1 ? lastLogRef : null}
              >
                <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                <Td>{log.clientIP}</Td>
                <Td isNumeric>{log.phoneNumber}</Td>
                <Td>{log.retryAfter}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RateLimitLogs;
