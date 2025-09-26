import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionConfig = {
  channel: string;
  table: string;
  schema?: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
};

export function useRealtimeSubscription(
  config: SubscriptionConfig,
  onUpdate: (payload: any) => void
) {
  useEffect(() => {
    let subscription: RealtimeChannel;

    const setupSubscription = async () => {
      subscription = supabase
        .channel(config.channel)
        .on(
          'postgres_changes',
          {
            event: config.event || '*',
            schema: config.schema || 'public',
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            console.log(`${config.table} change received:`, payload);
            onUpdate(payload);
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for ${config.channel}:`, status);
        });
    };

    setupSubscription();

    return () => {
      if (subscription) {
        console.log(`Unsubscribing from ${config.channel}`);
        subscription.unsubscribe();
      }
    };
  }, [config.channel, config.table, config.filter, config.event]);
}