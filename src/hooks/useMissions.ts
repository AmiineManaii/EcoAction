import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createMission, deleteMission, getMission, getMissions, Mission, MissionPayload, updateMission } from '../api/missions';

const missionsKey = ['missions'];

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
  const query = useQuery({
    queryKey: [...missionsKey, id],
    queryFn: () => getMission(id as number),
    enabled: typeof id === 'number',
  });

  return query;
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
      queryClient.setQueryData(['missions', id], mission);
    },
  });
}

function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMission(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: missionsKey });
      queryClient.removeQueries({ queryKey: ['missions', id] });
    },
  });
}

export { useMissions, useMission, useCreateMission, useUpdateMission, useDeleteMission };
