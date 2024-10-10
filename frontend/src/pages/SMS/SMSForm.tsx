import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  Heading,
} from "@chakra-ui/react";

const SMSForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    if (!phoneNumber || !recipientPhoneNumber || !message) {
      return;
    }
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.REACT_APP_HOST}/api/sms/send-sms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: Number(phoneNumber),
            recipientPhoneNumber: Number(recipientPhoneNumber),
            message,
          }),
        }
      );

      const result = await res.json();
      if (res.status === 200) setResponse("SMS Successfully Sent");
      else setResponse(result.message + " - Retry After: " + result.retryAfter);
    } catch (error) {
      setResponse("Failed to send SMS");
    }
  };

  return (
    <VStack marginY={"auto"}>
      <Heading as="h3">Send SMS</Heading>
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        justifyContent={"center"}
        maxHeight={"400px"}
      >
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Recipient Phone Number</FormLabel>
            <Input
              type="tel"
              value={recipientPhoneNumber}
              onChange={(e) => setRecipientPhoneNumber(e.target.value)}
              required
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Message</FormLabel>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </FormControl>

          <Button type="submit" colorScheme="blue">
            Send SMS
          </Button>
        </form>

        {response && (
          <Box mt={4} p={2} borderWidth="1px" borderRadius="lg">
            {response}
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default SMSForm;
