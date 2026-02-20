import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createMission,
  deleteMission,
  getMission,
  getMissions,
  Mission,
  MissionPayload,
  updateMission,
} from '../api/missions';


const missionsKey = ['missions'] as const;
const missionKey = (id: number) => ['missions', id] as const;


function useMissions() {
  const query = useQuery({
    queryKey: missionsKey,
    queryFn: getMissions,
  });

  return {
    missions: query.data ?? [],
    ...query,
  };
}


function useMission(id: number | undefined) {
  return useQuery({
    queryKey: missionKey(id as number),
    queryFn: () => getMission(id as number),
    enabled: typeof id === 'number',
  });
}


function useCreateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MissionPayload) => createMission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionsKey });
    },
  });
}


function useUpdateMission(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<MissionPayload>) => updateMission(id, payload),
    onSuccess: (mission: Mission) => {
      queryClient.invalidateQueries({ queryKey: missionsKey });
      queryClient.setQueryData(missionKey(id), mission);
    },
  });
}


function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMission(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: missionsKey });
      queryClient.removeQueries({ queryKey: missionKey(id) });
    },
  });
}


function useToggleParticipation(missionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { participants: number[]; slotsTaken: number }) =>
      updateMission(missionId, payload),

    
    onMutate: async (payload) => {
      
      await queryClient.cancelQueries({ queryKey: missionKey(missionId) });
      await queryClient.cancelQueries({ queryKey: missionsKey });

     
      const previousMission = queryClient.getQueryData<Mission>(missionKey(missionId));
      const previousMissions = queryClient.getQueryData<Mission[]>(missionsKey);

      
      queryClient.setQueryData<Mission>(missionKey(missionId), (old) => {
        if (!old) return old;
        return { ...old, ...payload };
      });

      
      queryClient.setQueryData<Mission[]>(missionsKey, (old = []) =>
        old.map((m) => (m.id === missionId ? { ...m, ...payload } : m)),
      );

      return { previousMission, previousMissions };
    },

    
    onError: (_err, _payload, context) => {
      if (context?.previousMission) {
        queryClient.setQueryData(missionKey(missionId), context.previousMission);
      }
      if (context?.previousMissions) {
        queryClient.setQueryData(missionsKey, context.previousMissions);
      }
    },

    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: missionKey(missionId) });
      queryClient.invalidateQueries({ queryKey: missionsKey });
    },
  });
}

export {
  useMissions,
  useMission,
  useCreateMission,
  useUpdateMission,
  useDeleteMission,
  useToggleParticipation,
};