import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateCase as generatedUseCreateCase,
  useDeleteCase as generatedUseDeleteCase,
  useAcknowledgeCase as generatedUseAcknowledgeCase,
  useListCases as generatedUseListCases,
  useGetCase as generatedUseGetCase,
  getListCasesQueryKey,
  getGetCaseQueryKey,
  type CreateCaseRequest
} from "@workspace/api-client-react";
import { useToast } from "./use-toast";

// Re-export queries so components can import everything from this file
export const useListCases = generatedUseListCases;
export const useGetCase = generatedUseGetCase;

// Wrapper hooks for mutations to handle invalidation and toast notifications automatically
export function useCreateCase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return generatedUseCreateCase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        toast({
          title: "Report Submitted",
          description: "The clinical report has been successfully analyzed and saved.",
        });
      },
      onError: (error) => {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting the report. Please try again.",
          variant: "destructive",
        });
      }
    }
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return generatedUseDeleteCase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        toast({
          title: "Case Deleted",
          description: "The case record has been removed.",
        });
      }
    }
  });
}

export function useAcknowledgeCase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return generatedUseAcknowledgeCase({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(data.id) });
        toast({
          title: "Alert Acknowledged",
          description: `Critical case for ${data.patientName} has been acknowledged.`,
        });
      }
    }
  });
}
