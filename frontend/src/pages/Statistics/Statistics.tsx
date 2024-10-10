import React from "react";
import { Heading, VStack } from "@chakra-ui/react";
import SMSStatistics from "./SMSStatistics";
import RateLimitStatistics from "./RateLimitStatistics";

export const Statistics: React.FC = () => {
  return (
    <VStack spacing={4}>
      <Heading as="h3">Statistics</Heading>
      <SMSStatistics />
      <RateLimitStatistics />
    </VStack>
  );
};

export default Statistics;
