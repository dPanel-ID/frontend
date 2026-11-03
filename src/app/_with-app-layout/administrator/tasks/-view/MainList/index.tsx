import { buildResponseView } from '@/widgets/response-view-builder';

import { TaskListState } from '../-presentation/TaskListState';
import { useAdminTasksDataModel } from '../../-model/tasks-data';

import { TasksEmptyState } from './TasksEmptyState';
import TaskTable from './TaskTable';

export default buildResponseView({
  useResponse: () => useAdminTasksDataModel((s) => s.tasks),
  fallbackError: TaskListState.Error,
  fallbackLoading: TaskListState.Loading,
  render: function Render(props) {
    const { rows } = props;

    if (rows.length < 1) return <TasksEmptyState />;

    return <TaskTable tasks={rows} />;
  },
});
