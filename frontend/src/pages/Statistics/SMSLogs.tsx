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

interface SMSRequestLog {
  type: string;
  clientIP: string;
  phoneNumber: number;
  status: boolean;
  timestamp: string;
}

export const SMSLogs: React.FC = () => {
  const [smsLogs, setSmsLogs] = useState<SMSRequestLog[]>([]);
  const lastLogRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.REACT_APP_HOST}/api/logs/stream-logs?logType=sms_requests`
    );

    eventSource.onmessage = (event) => {
      const data: SMSRequestLog = JSON.parse(event.data);
      setSmsLogs((prevLogs) => {
        // If the number of logs is 100, remove the oldest (first) one and add the new log
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
  }, [smsLogs]);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Heading size="md" mb={4}>
        SMS Request Logs
      </Heading>
      <TableContainer
        width={["340px", "400px", "800px"]}
        maxHeight={"30vh"}
        overflowY={"auto"}
      >
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Time</Th>
              <Th>IP</Th>
              <Th isNumeric>Phone Number</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {smsLogs.map((log, index) => (
              <Tr
                key={log.timestamp}
                ref={index === smsLogs.length - 1 ? lastLogRef : null}
              >
                <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                <Td>{log.clientIP}</Td>
                <Td isNumeric>{log.phoneNumber}</Td>
                <Td>{log.status ? "Success" : "Failure"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SMSLogs;
