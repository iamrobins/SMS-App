import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Spinner } from "@chakra-ui/react";

interface SMSStatisticsData {
  smsLastMinute: number;
  smsToday: number;
}

const SMSStatistics: React.FC = () => {
  const [smsStatistics, setSmsStatistics] = useState<SMSStatisticsData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSMSStatistics = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/sms/usage-statistics"
        );
        const data = await response.json();
        setSmsStatistics(data);
      } catch (error) {
        console.error("Error fetching SMS usage statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch statistics initially and every 10 seconds
    fetchSMSStatistics();
    const interval = setInterval(fetchSMSStatistics, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Heading size="md" mb={4}>
        SMS Usage Statistics
      </Heading>
      {loading ? (
        <Spinner />
      ) : smsStatistics ? (
        <>
          <Text>
            <strong>SMS Sent in the Last Minute:</strong>{" "}
            {smsStatistics.smsLastMinute}
          </Text>
          <Text>
            <strong>Total SMS Sent Today:</strong> {smsStatistics.smsToday}
          </Text>
        </>
      ) : (
        <Text>No data available</Text>
      )}
    </Box>
  );
};

export default SMSStatistics;
