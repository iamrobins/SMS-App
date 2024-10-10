import React from "react";
import { Heading, VStack } from "@chakra-ui/react";
import SMSStatistics from "./SMSStatistics";
import SMSLogs from "./SMSLogs";
import RateLimitLogs from "./RateLimitLogs";

export const Statistics: React.FC = () => {
  return (
    <VStack spacing={4}>
      <Heading as="h3">Statistics</Heading>
      <SMSStatistics />
      <SMSLogs />
      <RateLimitLogs />
    </VStack>
  );
};

export default Statistics;
