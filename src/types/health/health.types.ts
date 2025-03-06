export interface ReplicaSetMember {
  name: string;
  health: number;
  state: number;
}

export interface ReplicaSetStatus {
  members: ReplicaSetMember[];
}
