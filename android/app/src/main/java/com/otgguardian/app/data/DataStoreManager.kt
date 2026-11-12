package com.otgguardian.app.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "otg_guardian_prefs")

class DataStoreManager(private val context: Context) {

    companion object {
        val KEY_KEEP_ENABLED = booleanPreferencesKey("keep_otg_enabled")
        val KEY_AUTO_RECOVER = booleanPreferencesKey("auto_recover_on_timeout")
        val KEY_RECOVERY_MODE = stringPreferencesKey("recovery_mode")
        val KEY_NOTIFY_STATUS = booleanPreferencesKey("notify_on_status_change")
        val KEY_LAST_ACTIVATION = longPreferencesKey("last_otg_activation_time")
        val KEY_LAST_STATUS_CHANGE = longPreferencesKey("last_status_change_time")
        val KEY_LAST_KNOWN_STATE = stringPreferencesKey("last_known_otg_state")
        val KEY_RECOVERY_COUNT = intPreferencesKey("recovery_success_count")
    }

    val keepEnabledFlow: Flow<Boolean> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[KEY_KEEP_ENABLED] ?: false }

    val autoRecoverFlow: Flow<Boolean> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[KEY_AUTO_RECOVER] ?: true }

    val notifyStatusFlow: Flow<Boolean> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[KEY_NOTIFY_STATUS] ?: true }

    val recoveryModeFlow: Flow<RecoveryMode> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map {
            val name = it[KEY_RECOVERY_MODE] ?: RecoveryMode.ACCESSIBILITY_AUTO.name
            try {
                RecoveryMode.valueOf(name)
            } catch (_: Exception) {
                RecoveryMode.ACCESSIBILITY_AUTO
            }
        }

    val lastActivationTimeFlow: Flow<Long> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[KEY_LAST_ACTIVATION] ?: 0L }

    val lastStatusChangeTimeFlow: Flow<Long> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[KEY_LAST_STATUS_CHANGE] ?: 0L }

    val recoveryCountFlow: Flow<Int> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[KEY_RECOVERY_COUNT] ?: 0 }

    suspend fun setKeepEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_KEEP_ENABLED] = enabled }
    }

    suspend fun setAutoRecover(autoRecover: Boolean) {
        context.dataStore.edit { it[KEY_AUTO_RECOVER] = autoRecover }
    }

    suspend fun setRecoveryMode(mode: RecoveryMode) {
        context.dataStore.edit { it[KEY_RECOVERY_MODE] = mode.name }
    }

    suspend fun setNotifyStatus(notify: Boolean) {
        context.dataStore.edit { it[KEY_NOTIFY_STATUS] = notify }
    }

    suspend fun recordActivation(timestamp: Long = System.currentTimeMillis()) {
        context.dataStore.edit {
            it[KEY_LAST_ACTIVATION] = timestamp
            it[KEY_LAST_STATUS_CHANGE] = timestamp
            it[KEY_LAST_KNOWN_STATE] = OtgState.ON.name
        }
    }

    suspend fun recordStatusChange(state: OtgState, timestamp: Long = System.currentTimeMillis()) {
        context.dataStore.edit {
            it[KEY_LAST_STATUS_CHANGE] = timestamp
            it[KEY_LAST_KNOWN_STATE] = state.name
        }
    }

    suspend fun incrementRecoveryCount() {
        context.dataStore.edit {
            val current = it[KEY_RECOVERY_COUNT] ?: 0
            it[KEY_RECOVERY_COUNT] = current + 1
        }
    }
}
