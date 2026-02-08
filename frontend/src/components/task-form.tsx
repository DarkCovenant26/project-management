'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormValues } from '@/lib/validations/task';
import { DatePicker } from '@/components/ui/date-picker';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { TagPicker } from './tags/tag-picker';
import { UserMultiSelect } from './users/user-multi-select';
import { BlockerSelect } from './tasks/blocker-select';
import { Tag } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';

interface TaskFormProps {
    projectId: string | number;
    initialData?: Task;
    onSubmit: (data: TaskFormValues) => void;
    isSubmitting?: boolean;
}

export function TaskForm({ projectId, initialData, onSubmit, isSubmitting }: TaskFormProps) {
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema) as any,
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            priority: initialData?.priority || 'Medium',
            status: initialData?.status || 'backlog',
            task_type: initialData?.task_type || 'Feature',

            dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
            startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
            actualCompletionDate: initialData?.actualCompletionDate ? new Date(initialData.actualCompletionDate) : undefined,

            storyPoints: initialData?.storyPoints || 0,
            timeEstimate: initialData?.timeEstimate || undefined,
            timeSpent: initialData?.timeSpent || undefined,

            projectId: projectId,

            tagIds: initialData?.tags?.map(t => t.id) || [],
            assigneeIds: initialData?.assignees?.map(u => u.id) || [],
            blockedByIds: initialData?.blocked_by_ids || [],
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Task title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-1">
                        <FormField
                            control={form.control}
                            name="task_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Feature">Feature</SelectItem>
                                            <SelectItem value="Bug">Bug</SelectItem>
                                            <SelectItem value="Chore">Chore</SelectItem>
                                            <SelectItem value="Improvement">Improvement</SelectItem>
                                            <SelectItem value="Story">Story</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add details about this task..."
                                    className="resize-none min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={field.value === "Critical" ? "border-red-500 text-red-600 font-medium" : ""}>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Critical" className="text-red-600 font-medium">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="backlog">Backlog</SelectItem>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="storyPoints"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Story Points</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="timeEstimate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Est. Hours</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="e.g. 4"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="timeSpent"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time Spent</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="e.g. 2.5"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value || undefined}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value || undefined}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="assigneeIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assignees</FormLabel>
                            <FormControl>
                                <UserMultiSelect
                                    projectId={projectId}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tagIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <TagPicker
                                    projectId={projectId}
                                    value={initialData?.tags?.filter(t => field.value?.includes(t.id)) || []}
                                    onChange={(tags) => field.onChange(tags.map(t => t.id))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="blockedByIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-destructive flex items-center gap-1">
                                Dependencies (Blocked By)
                            </FormLabel>
                            <FormControl>
                                <BlockerSelect
                                    projectId={projectId}
                                    currentTaskId={initialData?.id}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter className="pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
